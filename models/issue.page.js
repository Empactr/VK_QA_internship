const { type } = require("process");
const {TOTP} =  require('otpauth');


exports.IssuePage = class IssuePage{
    /**
     * @param {import('playwright').Page} page
    */

    constructor(page){
        this.page = page;
        this.base_url = `https://github.com/${process.env.GITHUB_USERNAME}/${process.env.GITHUB_REPOSITORY}/issues`
    }

    async sign_in(){
        try{
            var totp = new TOTP({
                issuer:"GitHub",
                label:`GitHub:${process.env.GITHUB_USERNAME}`,
                algorithm:"SHA1",
                digits:6,
                period:30,
                secret:process.env.GITHUB_SECRET
            });
        
            //Заходим на страницу аутентификации
            await this.page.goto('https://github.com/login');
            await this.page.getByLabel('Username or email address').fill(process.env.GITHUB_USERNAME, {timeout:5000});
            await this.page.getByLabel('Password').fill(process.env.GITHUB_PASSWORD, {timeout:5000});
            await this.page.getByRole('button', {name:'Sign in', exact:true}).click({timeout:5000});
        
            //Нас кидает на двух-факторную аутентификацию
            await this.page.getByPlaceholder('XXXXXX').fill(totp.generate(),{timeout:5000});
        
            //Ждем загрузки главной страницы после авторизации
            await this.page.waitForSelector('.avatar-user', { timeout: 10000});
        
            await this.page.context().storageState({path:process.env.AUTH_FILE});
            
        }catch(error){
            if(await this.page.locator('.avatar-user').count() == 0){
                console.error(`[ERROR] ${error.message}`);
                return {
                    status:false,
                    err:error
                };
            }
        }
        return {
            status:true
        };
    }

    async goto(...params){
        let link = this.base_url;

        params.forEach((value, index) => {
            if(typeof value == 'string' || value instanceof String){
                if(value.charAt(0) != '/'){
                    value = `/${value}`;
                }
                if(value.charAt(value.length - 1) == '/'){
                    value = value.slice(0, value.length - 1);
                }
                link += value;
            }else{
                link += `/${value}`;
            }
        })
        await this.page.goto(link, {waitUntil:"domcontentloaded"});
    }

    async create_new_issue(title, description, labels, assignee){
        await this.goto();
        await this.page.getByRole('link', { name: 'New issue' }).click();

        //Находим тег 'input', у которого установлен 'placeholder' равным 'Title' и отвечает за название Issue, кликаем по нему
        await this.page.getByPlaceholder('Title').click();
        //Заполняем вышеуказанный тег текстом 'Issue 1'
        await this.page.getByPlaceholder('Title').fill(title);
    
        //Находим тег 'input', с отсуствующим placeholder`ом, который выполняет роль "Описания" создаваемого Issue
        await this.page.getByPlaceholder(' ', { exact: true }).click();
        //Заполняем его описанием
        await this.page.getByPlaceholder(' ', { exact: true }).fill(description);
    
        //Находим кнопку, содержащую текст "assign yourself" и кликаем по ней, чтобы задать себя как автора Issue
        await this.page.getByRole('button', { name: 'assign yourself' }).click();
        
        await this.page.locator('.clearfix').click();
    
        //Находим кнопку, содержащую текст "Labels", и кликаем по ней
        await this.page.getByRole('button', { name: 'Labels' }).click();
        //Задаем метки
        for(let i = 0; i < labels.length; i++){
            await this.page.getByText(labels.at(i)).click();
        }
    
        //Нажимаем вне раскрывающегося списка, чтобы закрыть его 
        await this.page.getByRole('button', { name: 'Labels' }).click();
    
        //Подтверждаем создание Issue
        await this.page.getByRole('button', { name: 'Submit new issue' }).click();
    }

    async lock_issue(issue_number){
        await this.goto(issue_number);
        //Находим кнопку с текстом "Delete issue"
        await this.page.getByRole('button', { name: 'Delete issue' }).click();
        //Раскрывается модальное окно, внутри находим кнопку с текстом "Delete this issue"
        await this.page.getByRole('button', { name: 'Delete this issue' }).click();
    }

    async update_issue(params){
        await this.goto(params.issue_number);

        //Раскрываем "выпадающее окно" с расширенными настройками
        await this.page.getByRole('button', { name: 'Show options' }).click();
        //Находим тег с текстом "Edit comment"
        await this.page.getByLabel('Edit comment').click();

        //Находим тег "input" с placeholder 'Leave a comment' и кликаем по нему
        await this.page.getByPlaceholder('Leave a comment').click();
        //Заполняем обновленным описанием
        await this.page.getByPlaceholder('Leave a comment').fill(params.description);

        //Подтверждаем изменения
        await this.page.getByRole('button', { name: 'Update comment' }).click();

    }
}
