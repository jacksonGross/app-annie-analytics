# app-annie-analytics
A small script to gather app analytics provided by [App Annie](https://www.appannie.com/).

### Installation
Firstly, make sure to have signed up for App Annie and have registered your accounts to collect the analytics. 
Then you will need to generate an [API Key](https://www.appannie.com/account/api/key/).
Finally, install the module with npm:

``` bash
npm install app-annie-analytics
```

### Usage
``` bash
aaa -h

Usage: aaa [options]

  Options:

    -h, --help               output usage information
    -V, --version            output the version number
    -A, --account [account]  account (App Store/Google Play) to inspect
    -a, --app [app]          app from account to inspect
    -o, --out [file]         output file
    -k, --key [key]          API Key (see https://support.appannie.com/hc/en-us/categories/200261564-Analytics-API-v1-2-)

```    

### Pull Requests
Always open for improvements to this module. There is still a lot of work to do, so feel free to submit a PR or raise an issue!