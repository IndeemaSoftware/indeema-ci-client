Indeema CI Web Client: Your personal online DevOps
########################################

This solution was created for web developers and DevOps to automize and speedup server setup process.
Client is compatible with `Indeema CI <https://ci.indeema.com/>`_

Main features
=============

* Setup server environment from scratch
* Setup multiple web projects on server
* Create own setup scripts
* Support GitLab CI templates
* Scripts market
* Self-hosted solution
* Linux, macOS and Windows support
* Plugins
* Documentation


Installation
============


Ubuntu 18+
-----


We recommended to install into Ubuntu 18.04 or higher:

.. code-block:: bash

    $ curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -

    $ sudo apt-get update && sudo apt-get install nodejs

    $ npm install -g @angular/cli@8

    $ git clone git://github.com/IndeemaSoftware/indeema-ci-client.git

    $ cd /path/to/indeema-ci-client/

    $ npm install

    $ ng build --prod


MacOS Mojave 10.14.6
-----


On macOS, HTTPie can be installed via `PORT <https://www.macports.org/>`_

.. code-block:: bash

    $ curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -

    $ sudo apt-get update && sudo apt-get install nodejs

    $ npm install -g @angular/cli@8

    $ git clone git://github.com/IndeemaSoftware/indeema-ci-client.git

    $ cd /path/to/indeema-ci-client/

    $ npm install

    $ ng build --prod
    

Fedora 31+
-----


.. code-block:: bash


    $ curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -

    $ sudo apt-get update && sudo apt-get install nodejs

    $ npm install -g @angular/cli@6

    $ git clone git://github.com/IndeemaSoftware/indeema-ci-client.git

    $ cd /path/to/indeema-ci-client/

    $ npm install

    $ ng build --prod
    
    

Launch
============


.. code-block:: bash

    $ ng start
    
    

Admin panel URL
===========

After installing and launch, you able to sign in into Indeema CI web client:

.. code-block:: bash

    http://localhost:4200
    

Project structure
==============

By default, Indeema CI client usign Angular 6 framework, so project structure is similar to this framework:

=================   =====================================================
``src/app``         Contains main logic of front-end-end part
``src/assets``      Contains front-end assets
``src/environment`` Contains configuration of front-end environment
=================   =====================================================
    

User support
------------

Please use the following support channels:

* `GitHub issues <https://github.com/IndeemaSoftware/indeema-ci-client/issues>`_
  for bug reports and feature requests.
* `Indeema CI <https://ci.indeema.com>`_
  to ask questions, discuss features, and for general discussion.
* `StackOverflow <https://stackoverflow.com>`_
  to ask questions (please make sure to use the
  `indeema-ci-web <https://stackoverflow.com/questions/tagged/indeema-ci-web>`_ tag).
* You can also send email directly to `<mailto:support@indeema.com>`_.


Authors
------------

See `Authors.rst <https://github.com/IndeemaSoftware/indeema-ci-client/blob/master/Authors.rst>`_.


Change log
----------

See `CHANGELOG <https://github.com/IndeemaSoftware/indeema-ci-client/blob/master/CHANGELOG.rst>`_.


Licence
-------

LGPL: `LICENSE <https://github.com/IndeemaSoftware/indeema-ci-client/blob/master/LICENSE>`_.


Powered by Indeema Software
-------

`Indeema Software Inc <https://indeema.com>`_
    
