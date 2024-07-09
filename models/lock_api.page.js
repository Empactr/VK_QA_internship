exports.LockAPIPage = class LockAPIPage{
    /**
     * 
     * @param {import('playwright').APIRequestContext} context 
     */
    constructor(context){
        this.context = context;
    }

    async lock_issue(issue_number){
        const response = await this.context.put(`./issues/${issue_number}/lock`,{
            data:{
                lock_reason: 'off-topic'
            }
        });
        return response.ok();
    }
}