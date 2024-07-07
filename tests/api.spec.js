const {test,expect} = require("@playwright/test"); //Импортируем необходимые методы для реализации автотестов

let apiContext;
let issueNumber;

//Определим apiContext, чтобы обращаться к API
test.beforeAll(async({playwright})=>{
    apiContext = await playwright.request.newContext({
        baseURL:"https://api.github.com",
        extraHTTPHeaders:{
            'Accept':'application/vnd.github.v3+json',
            'Authorization':`token ${process.env.GITHUB_API_TOKEN}`
        }
    })
})
test.afterAll(async({})=>{
    await apiContext.dispose();
})


test('[API] GitHub Issues: Создание, Обновление, Удаление', async ({request}) => {
    let updateError = undefined;

    try{
        await test.step('Create Issue Valid Data', async() => {
            
            //Используем POST, так как отправляем данные
            const newIssue = await apiContext.post(`/repos/${process.env.GITHUB_USERNAME}/${process.env.GITHUB_REPOSITORY}/issues`,{
                data:{
                    title:process.env.ISSUE_TITLE,
                    body:process.env.ISSUE_DESCRIPTION_INITIAL,
                    labels:['bug'],
                    assignee:process.env.GITHUB_USERNAME
                }
            });
            
            expect(newIssue.ok()).toBeTruthy(); //Проверяем статус ответа
            issueNumber = (await newIssue.json())['number'];
            
            //Проверяем на наличие созданного Issue
            let issues = await apiContext.get(`/repos/${process.env.GITHUB_USERNAME}/${process.env.GITHUB_REPOSITORY}/issues`);
            expect(issues.ok()).toBeTruthy();
            expect(await issues.json()).toContainEqual(expect.objectContaining({
                title:process.env.ISSUE_TITLE,
                body:process.env.ISSUE_DESCRIPTION_INITIAL,
            }));
        })
    }catch(error){
        //Прекращаем работу, так как не сможем Обновить и Удалить несуществующий Issue
        console.error(`[ERROR] ${error.message}`);
        throw error;
    }
    try{
        await test.step('Update Issue Valid Data', async() => {
            //Используем PATCH, так как хотим обновить данные
            const updatedIssue = await apiContext.patch(`/repos/${process.env.GITHUB_USERNAME}/${process.env.GITHUB_REPOSITORY}/issues/${issueNumber}`,{
                data:{
                    body:process.env.ISSUE_DESCRIPTION_UPDATE,
                    title:process.env.ISSUE_TITLE
                }
        
            });
            //Проверяем статус ответа
            expect(updatedIssue.ok()).toBeTruthy();
            
            //Проверяем изменилось ли описание
            const issues = await apiContext.get(`/repos/${process.env.GITHUB_USERNAME}/${process.env.GITHUB_REPOSITORY}/issues`);
            expect(issues.ok()).toBeTruthy(); //Проверяем статус ответа
            expect(await issues.json()).toContainEqual(expect.objectContaining({
                title:process.env.ISSUE_TITLE,
                body:process.env.ISSUE_DESCRIPTION_UPDATE,
            }));
        })
    }catch(error){
        //Продолжаем работу, так как можем попробовать Удалить Issue
        console.error(`[ERROR] ${error.message}`);
        updateError = error;
    }
    try{
        await test.step('Lock Issue Valid Data', async()=>{
            //Используем PATCH, так как мы не удялаем данные, а обновляем его состояние
            const lockIssue = await apiContext.patch(`/repos/${process.env.GITHUB_USERNAME}/${process.env.GITHUB_REPOSITORY}/issues/${issueNumber}`,{
                data:{
                    state:'closed'
                }
            });

            expect(lockIssue.ok()).toBeTruthy(); //Проверяем статус ответа
            
            //Проверяем отсутствует ли в списке Issue
            const issues = await apiContext.get(`/repos/${process.env.GITHUB_USERNAME}/${process.env.GITHUB_REPOSITORY}/issues`);
            
            expect(issues.ok()).toBeTruthy(); //Проверяем статус ответа
            expect(await issues.json()).not.toContainEqual(expect.objectContaining({
                number:issueNumber
            }));
        })
    }catch(error){
        console.error(`[ERROR] ${error.message}`);
        throw error;
    }
    
    if(updateError != undefined){
        //Если в процессе в кейсе Update возникла ошибка, значит кейс не был завершен успешно
        throw updateError;
    }
    
})

