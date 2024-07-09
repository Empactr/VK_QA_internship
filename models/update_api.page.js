exports.UpdateAPIPage = class UpdateAPIPage{
    /**
     * 
     * @param {import('playwright').APIRequestContext} context 
     */
    constructor(context){
        this.context = context
    }

    async update_issue(params){
        const response = await this.context.patch(`./issues/${params.issue_number}`,{
            data:{
                body:params.body,
                title:params.title
            }
    
        });
        return response.ok();
    }
}