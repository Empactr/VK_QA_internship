import {test as setup} from '@playwright/test';
import {config} from 'dotenv'
import {resolve} from 'path'

setup('Initialize global variables', async({ })=>{
    config({path:resolve(__dirname, '.env')});

    process.env.ISSUE_TABLE_URL = `https://github.com/${process.env.GITHUB_USERNAME}/${process.env.GITHUB_REPOSITORY}/issues`
    process.env.ISSUE_TITLE = "Issue 1"
    process.env.ISSUE_DESCRIPTION_INITIAL = "Я нашел баг";
    process.env.ISSUE_DESCRIPTION_UPDATE = "Я нашел новый баг";

    process.env.AUTH_FILE = `playwright/.auth/.${process.env.GITHUB_USERNAME}.json`;
})