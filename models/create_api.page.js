exports.CreateAPIPage = class CreateAPIPage{
    /**
     * 
     * @param {import('playwright').APIRequestContext} context 
     */
    constructor(context){
        this.context = context;
    }

    async create_new_issue(params){
        const new_issue = await this.context.post("./issues",{
            data:{
                title:params.title,
                body:params.body,
                labels:params.labels,
                assignee:params.assignee
            }
        });
        return {
            issue_number: (await new_issue.json()).number,
            status : new_issue.ok()
        };
    }
}