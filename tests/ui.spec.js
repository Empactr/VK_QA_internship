const {test,expect} = require("@playwright/test"); //Импортируем необходимые методы для реализации автотестов
const { timeout } = require("../playwright.config");
const {TOTP} =  require('otpauth');
const {IssuePage} = require('../models/issue.page');

let issueNumber;


test('[UI] GitHub Issues: Создание, Обновление, Удаление', async ({page})=>{
    let updateError = undefined;
    let handler = new IssuePage(page);
    let res = await handler.sign_in();
    if(!res.status){
        throw res.error;
    }

    /*
        Создаем Issue
    */
    try{
        await test.step('Create Issue', async ()=>{
            await handler.create_new_issue(
                process.env.ISSUE_TITLE, 
                process.env.ISSUE_DESCRIPTION_INITIAL, 
                [/bug/],
                process.env.GITHUB_USERNAME
            );
        
            issueNumber = await handler.page.url().split('/').pop();
            
            await handler.goto();

            // Ожидание того, что Issue присутствует на странице
            await expect(handler.page.locator(`[href="/${process.env.GITHUB_USERNAME}/${process.env.GITHUB_REPOSITORY}/issues/${issueNumber}"]`).first()).toBeVisible({timeout:5000});
        })

    }catch(error){
        //Прекращаем работу, так как не сможем Обновить и Удалить несуществующий Issue
        console.error(`[ERROR] ${error.message}`);
        throw error;
    }

    /*
        Обновляем Issue
    */
    try{
        await test.step('Update Issue', async ()=>{
            //Переходим по элементу списка
            await handler.update_issue({
                description: process.env.ISSUE_DESCRIPTION_UPDATE, 
                issue_number:issueNumber
            });
        
            //Проверяем обновленное описание
            const issueDescription = await handler.page.getByRole('cell', { name: process.env.ISSUE_DESCRIPTION_UPDATE }).getByRole('paragraph').textContent();
            await expect(issueDescription).toBe(process.env.ISSUE_DESCRIPTION_UPDATE)
        })

    }catch(error){
        //Продолжаем работу, так как можем попробовать Удалить Issue
        console.error(`[ERROR] ${error.message}`);
        updateError = error;
    }

    /*
        Блокируем Issue
    */
    try{
        await test.step('Lock Issue', async () => {
           await handler.lock_issue(issueNumber);
           
           //Проверяем на отсутствие Issue
           await expect(page.locator(`[href="/${process.env.GITHUB_USERNAME}/${process.env.GITHUB_REPOSITORY}/issues/${issueNumber}"]`).first()).not.toBeVisible({timeout:5000});
        })

    }catch(error){
        console.error(`[ERROR] ${error.message}`);
        throw error;
    }

    //Если во время выполнения 'Update Issue' возникла ошибка
    //То выбрасываем Error, так как Тест не был проведен полностью успешно
    if(updateError != undefined){
        throw updateError;
    }
})
