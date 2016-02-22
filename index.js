#!/usr/bin/env node
'use strict';

const program = require('commander');
const request = require('request');
const Promise = require('promise');
const moment = require('moment');
const fs = require('fs');

let authToken = '';
let filename = 'output.csv';
let accountName = '';
let appName = '';

function prepare(options) {
    return new Promise(function(resolve, reject) {
        if (!program.account) reject(new Error('Missing account name argument. Required to gather stats.'));
        if (!program.key) reject(new Error('Missing api key. Required to gather stats'));
        if (!program.app) console.log('defaulting to all apps.');
        if (!program.out) console.log("out defaulting to 'output.csv'.");
        accountName = program.account;
        authToken = `Bearer ${program.key}`;
        filename = program.out || 'output.csv';
        appName = program.app;
        resolve(accountName);
    });
};

function findInAccounts(account) {
    return new Promise(function(resolve, reject) {
        const url = 'https://api.appannie.com/v1.2/accounts';
        const options = {
            url,
            type: 'GET',
            headers: {
                Authorization: authToken
            }
        };
        request(options, function(err, results) {
            if (err) reject(err);
            try {
                const json = JSON.parse(results.body);
                const account = json.accounts.find(function(acc) {
                    return acc['account_name'].indexOf(accountName) === 0;
                });
                if (!account) reject(new Error(`Couldn't find account for ${account}.`));
                resolve(account);
            } catch (e) {
                reject(e);
            }
        });
    });
};

function findAppInAccount(account) {
    return new Promise(function(resolve, reject) {
        const url = `https://api.appannie.com/v1.2/accounts/${account['account_id']}/products`;
        const options = {
            url,
            type: 'GET',
            headers: {
                Authorization: authToken
            }
        };
        request(options, function(err, results) {
            if (err) reject(err);
            try {
                const json = JSON.parse(results.body);
                const app = json.products.find(function(prod) {
                    return prod['product_name'].indexOf(appName) === 0;
                });
                if (!app) reject(new Error(`Couldn't find app for ${appName}.`));
                resolve({ app, account });
            } catch (e) {
                reject(e);
            }
        });
    });
};

function getAppStats(params) {
    return new Promise(function(resolve, reject) {
        const app = params.app;
        const account = params.account;

        const startDate = moment().subtract(1, 'week').format('YYYY-MM-DD');
        const endDate = moment().format('YYYY-MM-DD');

        const url = `https://api.appannie.com/v1.2/accounts/${account['account_id']}/products/${app['product_id']}/sales?start_date=${startDate}&end_date=${endDate}`;
        const options = {
            url,
            type: 'GET',
            headers: {
                Authorization: authToken
            }
        };
        request(options, function(err, result) {
            if (err) reject(err);
            try {
                const json = JSON.parse(result.body);
                resolve(json);
            } catch (e) {
                reject(e);
            }
        });
    });
};

function formatForFile(results) {
    return new Promise(function(resolve, reject) {
        const product = results['sales_list'][0].units.product;
        const output = `"App_Name", "Account_Name", "Store", "Downloads", "Updates"\n"${appName}", "${accountName}", "${results.market}", "${product.downloads || 0}", "${product.updates || 0}"\n`;
        resolve(output);
    });
};

function writeToFile(data) {
    return new Promise(function(resolve, reject) {
        fs.writeFile(filename, data, function(err) {
            if (err) reject(err);
            resolve();
        });
    });
};

program
    .version('0.0.1')
    .option('-A, --account [account]', 'account (App Store/Google Play) to inspect')
    .option('-a, --app [app]', 'app from account to inspect')
    .option('-o, --out [file]', 'output file')
    .option('-k, --key [key]', 'API Key (see https://support.appannie.com/hc/en-us/categories/200261564-Analytics-API-v1-2-)')
    .parse(process.argv);

prepare(program)
    .then(findInAccounts)
    .then(findAppInAccount)
    .then(getAppStats)
    .then(formatForFile)
    .then(writeToFile)
    .then(function() {
        console.log('done!');
    })
    .catch(function(err) {
        console.log(err.stack);
        throw (err);
    });