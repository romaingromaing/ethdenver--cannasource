## CannaSource -- Seed to Sale tracking for the cannabis industry

This code contains 2 pass throughs to help simulate an outside API

Configure Apache + PHP to host the files from this directory, calls will be made with `/php`

OR checkout the branch for `django` and cd into `djproto` and run `pip install django`

`python manage.py runserver`  # no db usage so you can ignore complaints to migrate

you'll also need to run `truffle development` in a new console window

inside the truffle console run `migrate` and copy the contract address for `MITS Contract`

and paste into `js/deploy.js` under `contractInstance = MITSContract.at('0xADDRESS')`


The `django` branch includes UI improvements not on master.
