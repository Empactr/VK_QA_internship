exports.LockUIPage = class LockUIPage{
  /**
   * @param {import('playwright').Page} page 
   */
  constructor(page){
    this.page = page;
  }

  async lock_issue(issue_number){
    await this.goto(issue_number);
    //Находим кнопку с текстом "Delete issue"
    await this.page.getByRole('button', { name: 'Delete issue' }).click();
    //Раскрывается модальное окно, внутри находим кнопку с текстом "Delete this issue"
    await this.page.getByRole('button', { name: 'Delete this issue' }).click();
}
}