import {test as setup} from '@playwright/test';
import {config} from 'dotenv'
import {join} from 'path'

setup('Initialize global variables', async({ })=>{
    config({path:'env'});

    process.env.ISSUE_TABLE_URL = `https://github.com/${process.env.GITHUB_USERNAME}/${process.env.GITHUB_REPOSITORY}/issues`
    process.env.ISSUE_TITLE = "Issue 1"
    process.env.ISSUE_DESCRIPTION_INITIAL = "Я нашел баг";
    process.env.ISSUE_DESCRIPTION_UPDATE = "Я нашел новый баг";
})