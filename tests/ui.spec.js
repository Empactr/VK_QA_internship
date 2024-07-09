const {test,expect} = require("@playwright/test"); //Импортируем необходимые методы для реализации автотестов

const {CreateUIPage} = require("../models/create_ui.page");
const {UpdateUIPage} = require("../models/update_ui.page");
const { DeleteUIPage } = require("../models/delete_ui.page");


test.use({
    storageState:process.env.AUTH_FILE, 
    baseURL:`https://github.com/${process.env.GITHUB_USERNAME}/${process.env.GITHUB_REPOSITORY}/issues/`
});

async function create_test_issue(page){
    var create_page = new CreateUIPage(page);
    return await create_page.create_new_issue({
        title:process.env.ISSUE_TITLE, 
        body:process.env.ISSUE_DESCRIPTION_INITIAL, 
        labels:['bug'],
        assignee:process.env.GITHUB_USERNAME
    });
}
async function delete_test_issue(page, issue_number){
    const delete_page = new DeleteUIPage(page);
    await delete_page.delete_issue(issue_number);
}

test("[UI] Create issue with valid data", async({page}) => {
    //ПРЕДУСЛОВИЯ


    //ШАГИ
    const issue_number = await create_test_issue(page);
    
    await page.goto('');
    //** Проверяем создался ли Issue
    await expect(page.locator(`[href="/${process.env.GITHUB_USERNAME}/${process.env.GITHUB_REPOSITORY}/issues/${issue_number}"]`).first()).toBeVisible({timeout:5000});

    //ПОСТУСЛОВИЯ

   await delete_test_issue(page,issue_number);
});

test("[UI] Update issue with valid data", async({page}) => {
    //ПРЕДУСЛОВИЯ
    const issue_number = await create_test_issue(page);

    //ШАГИ
    const update_page = new UpdateUIPage(page);
    await update_page.update_issue({
        issue_number:issue_number,
        body:process.env.ISSUE_DESCRIPTION_UPDATE
    })

    //** Проверяем корректно ли обновилось описание
    const issue_body = await page.getByRole('cell', { name: process.env.ISSUE_DESCRIPTION_UPDATE }).getByRole('paragraph').textContent();
    await expect(issue_body).toBe(process.env.ISSUE_DESCRIPTION_UPDATE)

    //ПОСТУСЛОВИЯ

    await delete_test_issue(page,issue_number);
});

test("[UI] Delete issue with valid data", async({page}) => {
    //ПРЕДУСЛОВИЯ
    const issue_number = await create_test_issue(page);

    //ШАГИ

    await delete_test_issue(page,issue_number);
    

    
    //ПОСТУСЛОВИЯ

});
