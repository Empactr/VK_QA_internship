const {test,expect} = require("@playwright/test"); //Импортируем необходимые методы для реализации автотестов
const { CreateAPIPage } = require("../models/create_api.page");
const {LockAPIPage } = require('../models/lock_api.page');
const { UpdateAPIPage } = require("../models/update_api.page");

let apiContext;


async function check_status(status){
    expect(status).toBeTruthy();
}
async function delete_issue(issue_number){
    var lock_page = new LockAPIPage(apiContext);
    await lock_page.lock_issue(issue_number)
}

async function create_test_issue(context){
    const create_page = new CreateAPIPage(context);
    return (await create_page.create_new_issue({
        title:process.env.ISSUE_TITLE,
        body:process.env.ISSUE_DESCRIPTION_INITIAL,
        labels:['bug'],
        assignee:process.env.GITHUB_USERNAME
    }))
}
//Определим apiContext, чтобы обращаться к API
test.beforeAll(async({playwright})=>{
    apiContext = await playwright.request.newContext({
        baseURL:`https://api.github.com/repos/${process.env.GITHUB_USERNAME}/${process.env.GITHUB_REPOSITORY}/issues`,
        extraHTTPHeaders:{
            'User-Agent': 'request',
            'Accept':'application/vnd.github.v3+json',
            'Authorization':`token ${process.env.GITHUB_API_TOKEN}`
        }
    })
})
test.afterAll(async({})=>{
    await apiContext.dispose();
})

test("[API] Create issue with valid data", async ({request}) => {
    //ПРЕДУСЛОВИЯ
    
        /*Выполнены в `test.beforeAll` */

    //ШАГИ

    const {status, issue_number} = await create_test_issue(apiContext);
    await check_status(status);

    //**Проверяем создался ли Issue
    let issues = await apiContext.get("");
    await check_status(issues.ok());
    expect(await issues.json()).toContainEqual(expect.objectContaining({
        title:process.env.ISSUE_TITLE,
        body:process.env.ISSUE_DESCRIPTION_INITIAL,
    }));

    //ПОСТУСЛОВИЯ

    await delete_issue(issue_number);
})

test("[API] Update issue with valid data", async ({request}) => {
    //ПРЕДУСЛОВИЯ
    const {issue_number} = await create_test_issue(apiContext);

    //ШАГИ
    const update_page = new UpdateAPIPage(apiContext);
    const status = await update_page.update_issue({
        body:process.env.ISSUE_DESCRIPTION_UPDATE,
        title:process.env.ISSUE_TITLE,
        issue_number:issue_number
    })
    await check_status(status);


    //**Проверяем изменилось ли описание
    const issues = await apiContext.get("");
    await check_status(issues.ok());
    expect(await issues.json()).toContainEqual(expect.objectContaining({
        title:process.env.ISSUE_TITLE,
        body:process.env.ISSUE_DESCRIPTION_UPDATE,
    }));

    //ПОСТУСЛОВИЯ

    await delete_issue(issue_number);
})

test("[API] Lock issue with valid data", async ({request}) => {
    //ПРЕДУСЛОВИЯ
    const {issue_number} = await create_test_issue(apiContext);

    //ШАГИ

    var lock_page = new LockAPIPage(apiContext);
    var status = await lock_page.lock_issue(issue_number)
    await check_status(status);

    //**Проверяем отсутствует ли в списке Issue
    const issues = await apiContext.get("");
    
    await check_status(issues.ok());
    expect(await issues.json()).not.toContainEqual(expect.objectContaining({
        number:issue_number,
        locked:false
    }));
    //ПОСТУСЛОВИЯ

    await delete_issue(issue_number);
})
