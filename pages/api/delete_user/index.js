import { prisma } from "../../../lib/prisma.js"

// PUT /api/delete_user
export default async function handle(req, res) {
   const user_id = req.body.user_id

   const curr_user = await prisma.user.findUnique({
      where: {
         id: user_id,
      },
   })
         

   const deleteTransactions = await prisma.transaction.deleteMany({
      where: {
         user: curr_user,
      },
   })

   const deleteUser = await prisma.user.delete({
      where: {
         id: user_id,
      },
   })

   res.json(deleteUser)
}
