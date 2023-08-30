import { prisma } from "../../../lib/prisma.js"
import { updateBalance } from "../../../utils.js"

// PUT /api/approve_transactions
export default async function handle(req, res) {
    const sessionName = req.body.sessionName
    console.log(req.body.selectedTransactions)
    var transactions = req.body.selectedTransactions

    for (var i = 0; i < transactions.length; i++) {
        const trans_id = transactions[i]
        const post = await prisma.transaction.update({
            where: { id: trans_id },
            data: {
                status: "approved",
                approvedBy: sessionName
            },
        })

        var currTransaction = await prisma.transaction.findUnique({
            where: { id: trans_id },
            include: {
                user: {
                    select: {
                        id: true,
                        total_due: true,
                    },
                },
            },
        })

        // console.log(currTransaction.id)
        var currDue = currTransaction.user.total_due
        var currAmount = currTransaction.amount
        const due = currDue - currAmount

        const post1 = await prisma.user.update({
            where: { id: currTransaction.user.id },
            data: {
                total_due: parseFloat(due),
            },
        })
    }

    return res.json("success")
}
