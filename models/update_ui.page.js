exports.UpdateUIPage = class UpdateUIPage{
  /**
     * @param {import('playwright').Page} page
    */
  constructor(page){
    this.page = page;
  }

  async update_issue(params){
    await this.page.goto(`./${params.issue_number}`);

    //Раскрываем "выпадающее окно" с расширенными настройками
    await this.page.getByRole('button', { name: 'Show options' }).click();
    //Находим тег с текстом "Edit comment"
    await this.page.getByLabel('Edit comment').click();

    //Находим тег "input" с placeholder 'Leave a comment' и кликаем по нему
    await this.page.getByPlaceholder('Leave a comment').click();
    //Заполняем обновленным описанием
    await this.page.getByPlaceholder('Leave a comment').fill(params.body);

    await this.page.getByRole('button',{name:'Update comment'}).click();
}
}