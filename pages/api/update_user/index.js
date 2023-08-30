import {prisma} from "../../../lib/prisma.js";

// PUT /api/update_user
export default async function handle(req, res) {
    const user_id = req.body.user_id;
    const name = req.body.name;
    const gradYear = req.body.gradYear;
    // const role = req.body.role;
    const email = req.body.email;
    const is_rookie = req.body.role === "true" ? true : false;
    console.log("body", req.body)
    
    const post = await prisma.user.update({
        where: { id: user_id },
        data: {
            name: name,
            grad_year: gradYear,
            email: email,
            is_rookie: is_rookie,
        },
    });
    res.json(post);
}