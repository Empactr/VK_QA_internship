exports.CreateUIPage = class CreateUIPage{
  /**
     * @param {import('playwright').Page} page
    */
  constructor(page){
    this.page = page;
    this.link = process.env.ISSUE_TABLE_URL;
  }

  async create_new_issue(params){
    await this.page.goto('');
    await this.page.getByRole('link', { name: 'New issue' }).click();

    //Находим тег 'input', у которого установлен 'placeholder' равным 'Title' и отвечает за название Issue, кликаем по нему
    await this.page.getByPlaceholder('Title').click();
    //Заполняем вышеуказанный тег текстом 'Issue 1'
    await this.page.getByPlaceholder('Title').fill(params.title);

    //Находим тег 'input', с отсуствующим placeholder`ом, который выполняет роль "Описания" создаваемого Issue
    await this.page.getByPlaceholder(' ', { exact: true }).click();
    //Заполняем его описанием
    await this.page.getByPlaceholder(' ', { exact: true }).fill(params.body);

    //Находим кнопку, содержащую текст "assign yourself" и кликаем по ней, чтобы задать себя как автора Issue
    await this.page.getByRole('button', { name: 'assign yourself' }).click();
    
    await this.page.locator('.clearfix').click();

    //Находим кнопку, содержащую текст "Labels", и кликаем по ней
    await this.page.getByRole('button', { name: 'Labels' }).click();
    //Задаем метки
    for(let i = 0; i < params.labels.length; i++){
        await this.page.getByText(params.labels.at(i)).click();
    }

    //Нажимаем вне раскрывающегося списка, чтобы закрыть его 
    await this.page.getByRole('button', { name: 'Labels' }).click();

    //Подтверждаем создание Issue
    await this.page.getByRole('button', { name: 'Submit new issue' }).click();

    return this.page.url().split('/').pop();
}

}