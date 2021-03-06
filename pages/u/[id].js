import styles from "../../styles/UserPage.module.css"
import { signIn, signOut, useSession } from "next-auth/react"
import { useEffect } from "react"
import Loading from "../../components/Loading"
import { prisma } from "../../lib/prisma.js"

export const getServerSideProps = async ({ params }) => {
   const user = await prisma.user.findUnique({
      where: {
         id: String(params?.id),
      },
      include: {
         transactions: {
            select: {
               id: true,
               updatedAt: true,
               amount: true,
               status: true,
               type: true,
               description: true,
               semester: true,
               turningInCheck: true,
            },
         },
      },
   })

   console.log("id:", params?.id)
   console.log("user:", user)

   if (user.createdAt !== null) {
      user.createdAt = user.createdAt.toString()
   }
   if (user.updatedAt !== null) {
      user.updatedAt = user.updatedAt.toISOString()
   }
   if (user.transactions !== null) {
      for (const transaction of user.transactions) {
         if (transaction.updatedAt !== null) {
            transaction.updatedAt = transaction.updatedAt.toISOString()
         }
      }
   }

   console.log("transactions:", user.transactions)

   return {
      props: user,
   }
}

export default function UserPage(props) {
   const { data: session, status } = useSession()

   if (status === "loading") {
      return <Loading />
   }

   //  useEffect(() => {
   //     console.log("props:", props)
   //  }, [])

   function getGradYearFormatting(gy) {
      if (gy === null) {
         return ""
      }
      return "('" + gy.slice(gy.length - 2) + ")"
   }

   function getDateFormatting(isoDate) {
      var date = new Date(isoDate)
      var year = date.getFullYear()
      var day = date.getDate()
      var month = date.getMonth() + 1
      return month + "/" + day + "/" + year
   }

  function formatCurrency(num) {
    return "$" + num.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
  }

  function toSentenceCase(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  }

  function getStatusStyle(status) {
    const obj = {
      "color": status === "pending" ? "red" : "green",
      "fontStyle": status === "pending" ? "italic" : "normal",
    }
    return obj
  }

  function getItemStyle(status) {
    const obj = {
      "color": status === "pending" ? "grey" : "black",
      "fontStyle": status === "pending" ? "italic" : "normal",
    }
    return obj
  }

   return (
      <div className={styles.container}>
         <div className={styles.header}>
            <div>
               <p className={styles.name}>{props.name}</p>
               <p className={styles.gradYear}>
                  {getGradYearFormatting(props.grad_year)}
               </p>
            </div>
            <p className={styles.totalDueContainer}>
               Total due:{" "}
               <span className={styles.totalDue}>${props.total_due}</span>
            </p>
         </div>
         <div className={styles.userActions}>
            <button className={styles.newTransaction} onClick={() => props.handleNewTransactionClick()}>
               + Add a RaR or payment
            </button>
         </div>
         <p>Transactions:</p>

         {(!props.transactions || props.transactions.length === 0) && (
            <div>No transactions found</div>
         )}
         <div>
            {props.transactions?.length !== 0 && (
               <table className={styles.table}>
                  <thead>
                     <tr>
                        <th className={styles.updatedCol}>Updated</th>
                        <th className={styles.amountCol}>Amount</th>
                        <th className={styles.typeCol}>Type</th>
                        <th className={styles.descriptionCol}>Description</th>
                        <th className={styles.statusCol}>Status</th>
                     </tr>
                  </thead>
                  <tbody>
                     {props.transactions.map((transaction) => (
                        <tr>
                           <td style={getItemStyle(transaction.status)}>{getDateFormatting(transaction.updatedAt)}</td>
                           <td style={getItemStyle(transaction.status)}>{formatCurrency(transaction.amount)}</td>
                           <td style={getItemStyle(transaction.status)}>{transaction.type}</td>
                           <td style={getItemStyle(transaction.status)}>{transaction.description}</td>
                           <td style={getStatusStyle(transaction.status)}>{toSentenceCase(transaction.status)}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            )}
         </div>
      </div>
   )
}
