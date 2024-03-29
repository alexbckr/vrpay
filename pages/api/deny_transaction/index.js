import { prisma } from '../../../lib/prisma.js';

// PUT /api/deny_transaction
export default async function handle(req, res) {
    const trans_id = req.body.trans_id

    const post = await prisma.transaction.update({
        where: { id: trans_id },
        data: {
            status: "denied"
        },
    });
    res.json(post);
}