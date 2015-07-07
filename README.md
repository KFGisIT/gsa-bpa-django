![Yuck.io Screenshot](screenshot.png)

#User Story#
##Melanie - The Soccer Mom Down the Street##
###Background###
Melanie and George live in Everytown, USA with their three kids George, Jr., Brittany, and Brendan. She drives a late model mini-van, spends her evenings/weekends on her kids' soccer, and relaxes each night watching the evening news. She worries about her family's health and carefully watches what her kids and husband eat.

###Interview with Melanie###
![Picture of Melanie](https://s3.amazonaws.com/rapgenius/soccer-mom-sm.jpg "Meet Melanie")

The kids all keep me hopping with three different soccer practice schedules, matches, tournaments and scrimmages. 
Since we live in the tri-state area; and with the schedules of George Jr & Brittany, we're *always* crossing states lines for games. 

After the PTA meeting last week, a few of us were talking about the latest food recall, 
and I mentioned how worried I was about the food we eat and how much time it took going through recall notices to see if our area was affected. 
One of my friends told that she just started using a new website to check government postings for food enforcement action for our area and wherever they traveled.

I immediately pulled out my phone and bookmarked the site. 
I had always been nervous about food recalls when we're traveling, and this seems like the solution :)
All I have to do is punch in the state where I am and I can see a list of all of the recalls in the area! It's amazing.

One of the things that struck me is how cute the site is. 
The design makes it easy to see information where I am, or where my parents live out of state, or wherever we happen to be traveling, and understand what I'm seeing. 
It even makes it easier to read. 
These recalls can be seriously depressing to pour over, and somehow it seems much more friendly now.
 
I was happy to see that I can check the same kind of information for pharmacies and drug recalls in the area. 
The kids always seem to be getting hurt, and after a 3 hour drive with the kids and four hours of games, I need a few tylenol.
I never even thought about checking the recalls on them before, now I can't imagine going into a corner pharmacy without looking at Yuck.io first.

Now that I know I can just click a switch, I've been spending more time on the site in the last month to make sure none of George's heart medicine is on the yuck-list.
At first he called me paranoid for always checking the site, but lately he's even on it at work to make sure none of the medicine he uses at his dental practices is showing up on the yuck-list.

Since the other local moms and I stay in touch on facebook and I've been getting more twitter followers from the school, 
I really like the simple way to post a yuck from the yuck-list to my wall or tweet a yuck to get the word out.

##System Engineering##

###Configuration Management###

The following configuration steps assume a fresh installation of [Debian Jessie (8.1)](https://www.debian.org/releases/stable/)

It is also important to clone the [installation repository](https://github.com/KFGisIT/gsa-bpa-docker-ci-demo) for access to the necessary configuration and scripts. For purposes of this installation, we'll assume that it's been cloned to the home directory.

**Install Pre-requisites**

```bash
# Install packages.
$ apt-get update
$ apt-get install -y \
# for dev
        build-essential \
        git \
        openssh-server \
        aptitude \
# required
        python3-dev \
	python3 \
	python3-pip \
        python3-setuptools \
        nginx \
        sqlite3 \
        supervisor \
        vim \
        nodejs \
        npm \
        curl \
# for automatic security updates
        unattended-upgrades \
	apt-listchanges \
	mailutils 
```

**Path fix for Node.js**

```bash
$ ln -s /usr/bin/nodejs /usr/bin/node 
```
**Setup Pip, Dependencies & Configure WSGI**

```bash
$ easy_install3 pip

$ pip3 install -U pip
$ pip3 install virtualenv
$ virtualenv /env
$ DEBIAN_FRONTEND=noninteractive && \
    apt-get install -y uwsgi uwsgi-plugin-python && \
    rm /etc/uwsgi/ -rf

$ ./config/uwsgi.conf /etc/uwsgi.conf

$ apt-get clean
```

**Setup SSH**
NOTE: SSH is usually NOT needed in PRODUCTION environments!


```bash
# Use these two commands to manually specify a password
$ echo 'root:PleaseDontDoThis' | chpasswd
$ sed -i 's/PermitRootLogin without-password PermitRootLogin yes/' /etc/ssh/sshd_config
$ mkdir -p /root/.ssh/ && touch /root/.ssh/authorized_keys
$ mkdir /var/run/sshd && chmod 0755 /var/run/sshd
$ sed 's@session\s*required\s*pam_loginuid.so@session optional pam_loginuid.so@g' -i /etc/pam.d/sshd

# This file missing for you? It's different on every system. 
# It's part of passwordless SSH authentication; it's meant to contain YOUR public SSH key.  
# If this is not a familiar concept, please use the helper docker_ssh_auth script to help you generate the authorized_keys 
```
**Key Configuration Using a Text Editor**

```bash 
# Append the appropriate  
# authorized_keys to /root/.ssh/authorized_keys
```
**Fix SSH Permissions**

```bash
$ chmod 0700 /root/.ssh
$ chmod 0600 /root/.ssh/authorized_keys
```

**Setup Unattended Upgrades/Updates (security only)**

```bash
$ config/apt.conf.d/50unattended-upgrades /etc/apt/apt.conf.d/50unattended-upgrades
$ echo "Unattended-Upgrade::Mail \"$YOUR_EMAIL\";" >> /etc/apt/apt.conf.d/50unattended-upgrades
```

**Setup nginx as the supervised container process**

```bash
$ echo "daemon off;" >> /etc/nginx/nginx.conf &&\
  rm /etc/nginx/sites-enabled/default &&\
  ln -s /opt/django/django.conf /etc/nginx/sites-enabled/ &&\
  ln -s /opt/django/supervisord.conf /etc/supervisor/conf.d/

$ echo -e '[program:apache2]\ncommand=/bin/bash -c "source /etc/apache2/envvars && exec /usr/sbin/apache2 -DFOREGROUND"\nautorestart=true\n\n' >> /etc/supervisor/supervisord.conf

$ echo -e '[program:mysql]\ncommand=/usr/bin/pidproxy /var/run/mysqld/mysqld.pid /usr/sbin/mysqld\nautorestart=true\n\n' >> /etc/supervisor/supervisord.conf

$ echo -e '[program:sshd]\ncommand=/usr/sbin/sshd -D\n\n' >> /etc/supervisor/supervisord.conf

$ echo -e '[program:blackfire]\ncommand=/usr/local/bin/launch-blackfire\n\n' >> /etc/supervisor/supervisord.conf
```

**Setup Django & Checkout the Project from GitHub**

```bash
$ cp ~/config/django-requirements.txt /tmp/requirements.txt

$ pip install -r /tmp/requirements.txt

$ /env/bin/pip3 install --upgrade setuptools

$ update-alternatives --install /usr/bin/python python /usr/bin/python2.7 1

$ update-alternatives --install /usr/bin/python python /usr/bin/python3.4 2

$ apt-get install --reinstall python-pkg-resources

$ cp ~/shared/yuck.io/ /opt/django/

$ cd /opt/django

#Switch over virutal enviornments
$ source /env/bin/activate
$ source /opt/python/current/env

#Clone the full project repository
$ git clone https://github.com/KFGisIT/gsa-bpa-django.git .

#Install dependencies
$ npm install -g bower grunt-cli yuglify uglifyjs && cat bower.json 

$ bower install --allow-root --config.interactive=false
# misc tweaks

$cd /var/www/html
$ mkdir -p /var/www/htmlsites/default/files && \
$ chmod a+w /var/www/html/sites/default -R && \
$ mkdir /var/www/html/sites/all/modules/contrib -p && \
$	mkdir /var/www/html/sites/all/modules/custom && \
$	mkdir /var/www/html/sites/all/themes/contrib -p && \
$	mkdir /var/www/html/sites/all/themes/custom && \
$	chown -R www-data:www-data /var/www/html/
	
$ drush dl admin_menu devel && \
 drush en -y admin_menu simpletest && \
 drush vset "admin_menu_tweak_modules" 1
```
**Server Deployment**
Several decisions can be made with respect to deployment. 

```bash
# Build for uwsgi
$ ["/usr/bin/uwsgi", "--ini", "/etc/uwsgi.conf"]

# Patch for a bug with bower, collectstatic, and fonts
# workaround:
# https://github.com/brunch/brunch/issues/633 
$ cp app/static/bower_components/bootstrap/fonts/* app/static/bower_components/select2/docs/vendor/fonts

#run directly, for development/debugging
$ mkdir /opt/django/app/static/components && \ 
    python3 ./manage.py collectstatic --noinput 

#for debugging only
$ python3 ./manage.py runserver 0.0.0.0:5000


# Build for uwsgi+lightweight http, if you want 
$ ["/usr/bin/uwsgi", "--ini", "/etc/uwsgi.conf"]


# The files could also be served via nginx, which is outside the scope of this documentation
```

###Architecture##
*	Linux-Apache-Python Server Stack
*	Docker
*	HTML5
* 	CSS3
*	Python 3.3.*
*	Django 1.7.*
*	Selenium 2.46.*
*	JavaScript 
*	jQuery 2.1.4
* 	Bootstrap 3.3.*
* 	Bower 0.1.0
*	Npm 2.10.1
*	Pip 7.0.3
