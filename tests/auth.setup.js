const {TOTP} = require('otpauth');
const {test} = require('@playwright/test');
const {join} = require('path');

process.env.AUTH_FILE =  join(__dirname,`../playwright/.auth/.${process.env.GITHUB_USERNAME}.json`);

test("Authenticate", async ({page}) => {
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
        await page.goto('https://github.com/login');
        await page.getByLabel('Username or email address').fill(process.env.GITHUB_USERNAME, {timeout:5000});
        await page.getByLabel('Password').fill(process.env.GITHUB_PASSWORD, {timeout:5000});
        await page.getByRole('button', {name:'Sign in', exact:true}).click({timeout:5000});
    
        //Нас может кинуть на двух-факторную аутентификацию
        await page.getByPlaceholder('XXXXXX').fill(totp.generate(),{timeout:5000});
    
        //Ждем загрузки главной страницы после авторизации
        await page.waitForSelector('.avatar-user', { timeout: 10000});
    }catch(error){
        if(await page.locator('.avatar-user').count() == 0){
            console.error(`[ERROR] ${error.message}`);
            return {
                status:false,
                err:error
            };
        }
    }
    await page.context().storageState({path:process.env.AUTH_FILE});
    await page.close();

    return {
        status:true
    };
})

