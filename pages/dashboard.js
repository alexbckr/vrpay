import { useSession } from "next-auth/react"
import { prisma } from "../lib/prisma.js"
import styles from "../styles/Admin.module.css"
import Loading from "../components/Loading"
import { useState } from "react"
import {
   formatMoney,
   getRoleFormatting,
   deleteUser,
} from "../utils.js"
import Router from "next/router.js"
import { Input, Button, Modal, useModal, Table, Text } from "@geist-ui/core"
import TransactionDetailsContent from "../components/TransactionDetailsContent"
import NewTransactionContent from "../components/NewTransactionContent"
import UserDetailsContent from "../components/UserDetailsContent"

export const getServerSideProps = async () => {
   var unverified_users = await prisma.user.findMany({
      where: { is_verified: false },
   })

   var pending_transactions = await prisma.transaction.findMany({
      where: { status: "pending" },
      include: {
         user: {
            select: {
               name: true,
            },
         },
      },
   })

   var verified_users = await prisma.user.findMany({
      where: { is_verified: true },
   })

   var today = new Date();
   var mm = String(today.getMonth() + 1).padStart(2, '0');
   var yyyy = today.getFullYear();
   
   var year = mm >= '06' ? yyyy : yyyy - 1;
   var yearString = year.toString();

   var graduating_users = await prisma.user.findMany({
      where: { grad_year: yearString },
   })


   unverified_users.map((user) => {
      if (user.createdAt !== null) {
         user.createdAt = user.createdAt.toString()
      }
      if (user.updatedAt !== null) {
         user.updatedAt = user.updatedAt.toString()
      }
   })

   verified_users.map((user) => {
      if (user.createdAt !== null) {
         user.createdAt = user.createdAt.toString()
      }
      if (user.updatedAt !== null) {
         user.updatedAt = user.updatedAt.toString()
      }
   })

   pending_transactions.map((transaction) => {
      if (transaction.createdAt !== null) {
         transaction.createdAt = transaction.createdAt.toString()
      }
      if (transaction.updatedAt !== null) {
         transaction.updatedAt = transaction.updatedAt.toString()
      }
   })

   unverified_users = unverified_users?.sort((a, b) =>
      a.name.localeCompare(b.name)
   )
   verified_users = verified_users?.sort((a, b) => a.name.localeCompare(b.name))

   pending_transactions = pending_transactions?.sort((a, b) =>
      a.user.name.localeCompare(b.user.name)
   )

   console.log("unverified_users:", unverified_users)
   console.log("verified_users:", verified_users)
   console.log("pending_transactions:", pending_transactions)

   return { props: { unverified_users, verified_users, pending_transactions } }
}

export default function Admin(props) {
   const { data: session, status } = useSession()
   const { visible, setVisible, bindings } = useModal()
   const [relevantTransaction, setRelevantTransaction] = useState(null)
   const [relevantUser, setRelevantUser] = useState(null)
   const [viewingUser, setViewingUser] = useState(false)
   const [relevantUID, setRelevantUID] = useState(null)
   const [relevantName, setRelevantName] = useState(null)
   const [viewingDetails, setViewingDetails] = useState(false)

   const width_name = "12%"
   const width_gy = "8%"
   const width_role = "120px"
   const width_balance = "80px"
   const width_actions = "180px"

   if (status === "loading") {
      return <Loading />
   }

   const verifyUser = async (user_id) => {
      const body = { user_id }

      try {
         console.log(user_id)
         await fetch("/api/verify_user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
         }).then((res) => {
            Router.reload()
         })
      } catch (error) {
         console.log("error verifying user:", error)
      }
   }

   const cellText = (value, rowData, rowIndex) => {
      return (
         <Text auto scale={1 / 2}>
            {value}
         </Text>
      )
   }

   const athleteRole = (value, rowData, rowIndex) => {
      return (
         <Text auto scale={1 / 2} font="14px">
            {/* {rowData?.is_rookie} */}
            {getRoleFormatting(value, rowData.is_rookie)}
         </Text>
      )
   }

   const athleteName = (value, rowData, rowIndex) => {
      return (
         <p
            auto
            scale={1 / 2}
            style={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={() => {
               Router.push("/u/[id]", `/u/${rowData?.id}`)
            }}
         >
            {value}
         </p>
      )
   }

   const unverifiedName = (value, rowData, rowIndex) => {
      return (
         <p
            auto
            scale={1 / 2}
            className={styles.nameSection}
         >
            {value}
         </p>
      )
   }

   const emailText = (value, rowData, rowIndex) => {
      return (
         <p
            auto
            scale={1 / 2}
            className={styles.emailSection}
         >
            {value}
         </p>
      )
   }

   const userActions = (value, rowData, rowIndex) => {
      return (
         <div className={styles.verifyTD}>
            <Text
               auto
               scale={1 / 2}
               className={styles.verifyButton}
               onClick={() => verifyUser(rowData.id)}
            >
               Verify
            </Text>
            <Text
               auto
               scale={1 / 2}
               className={styles.verifyButton}
               onClick={() => deleteUser(rowData.id)}
            >
               Delete
            </Text>
            <Text
               auto
               scale={1 / 2}
               font="14px"
               className={styles.verifyButton}
               onClick={() => {
                  setViewingUser(true)
                  setVisible(true)
                  setRelevantUser(rowData)
               }}
            >
               Edit
            </Text>
         </div>
      )
      }

   const cellMoney = (value, rowData, rowIndex) => {
      return (
         <p
            auto
            scale={1 / 2}
            style={{
               justifyContent: "right",
               flexGrow: "1",
               color: value > 0 ? "red" : "black",
            }}
         >
            {formatMoney.format(value)}
         </p>
      )
   }

   const cellMoneyTransaction = (value, rowData, rowIndex) => {
      return (
         <p
            auto
            scale={1 / 2}
            style={{
               justifyContent: "right",
               flexGrow: "1",
            }}
         >
            {formatMoney.format(value)}
         </p>
      )
   }

   const transactionAthlete = (value, rowData, rowIndex) => {
      return (
         <p auto scale={1 / 2}>
            {rowData?.user?.name}
         </p>
      )
   }

   const transactionOptions = (value, rowData, rowIndex) => {
      return (
         <Text
            auto
            style={{ cursor: "pointer" }}
            onClick={() => {
               setViewingDetails(true)
               setRelevantTransaction(rowData)
               setVisible(true)
            }}
         >
            Edit/Approve
         </Text>
      )
   }

   const userEmail = (value, rowData, rowIndex) => {
      return (
         <p
            auto
            scale={1 / 2}
         >
            {value}
         </p>
      )
   }

   if (session?.is_verified && session.role === "admin") {
      return (
         <div className={styles.container}>
            <h1 className={styles.title}>Dashboard</h1>
            <Button
               auto
               onClick={() => {
                  setViewingDetails(false)
                  setVisible(true)
               }}
               style={{ marginTop: "16px" }}
            >
               New transaction
            </Button>
            <Modal {...bindings}>
               {viewingUser ? (
                  <UserDetailsContent
                     user={relevantUser}
                     setVisible={setVisible}
                  />
               ) : (
               viewingDetails ? (
                  <TransactionDetailsContent
                     transaction={relevantTransaction}
                     setVisible={setVisible}
                     uid={relevantUID}
                     name={relevantName}
                  />
               ) : (
                  <NewTransactionContent setVisible={setVisible} />
               ))}
            </Modal>
            {props.unverified_users?.length > 0 && (
               <div className={styles.unverifiedUsersContainer}>
                  <h2 className={styles.sectionHeading}>Unverified Users</h2>
                  <Table data={props.unverified_users}>
                     <Table.Column
                        prop="name"
                        label="Name"
                        render={unverifiedName}
                        width={width_name}
                     />
                     <Table.Column
                        prop="role"
                        label="Role"
                        render={athleteRole}
                        width={width_role}
                     />
                     <Table.Column
                        prop="grad_year"
                        label="Grad Year"
                        render={emailText}
                        width={width_gy}
                     />
                     <Table.Column
                        prop="email"
                        label="Email"
                        render={emailText}
                     />
                     <Table.Column
                        prop="actions"
                        label="Actions"
                        render={userActions}
                        width={width_actions}
                     />
                  </Table>
               </div>
            )}

            {props.pending_transactions?.length > 0 && (
               <div>
                  <h2 className={styles.sectionHeading}>
                     Pending Transactions
                  </h2>
                  <Table data={props.pending_transactions}>
                     <Table.Column
                        className={styles.tableCell}
                        prop="name"
                        label="Athlete"
                        render={transactionAthlete}
                        width={width_name}
                     />
                     <Table.Column
                        prop="type"
                        label="Type"
                        render={cellText}
                        width={width_role}
                     />
                     <Table.Column
                        prop="description"
                        label="Description"
                        render={cellText}
                     />
                     <Table.Column
                        prop="amount"
                        label="Amount"
                        render={cellMoneyTransaction}
                        width={width_balance}
                     />
                     <Table.Column
                        prop="actions"
                        label="Actions"
                        width="120px"
                        render={transactionOptions}
                     />
                  </Table>
               </div>
            )}

            <h2 className={styles.sectionHeading}>Athletes</h2>
            <Table data={props.verified_users}>
               <Table.Column prop="name" label="Athlete" render={athleteName} width={width_name}/>
               <Table.Column
                  prop="role"
                  label="Role"
                  render={athleteRole}
                  width={width_role}
               />
               <Table.Column
                  prop="grad_year"
                  label="Grad Year"
                  render={emailText}
                  width={width_gy}
               />
               <Table.Column 
                  prop="email" 
                  label="Email" 
                  render={userEmail}
               />
               <Table.Column
                  prop="total_due"
                  label="Total Due"
                  render={cellMoney}
                  width={width_balance}
               />
            </Table>
         </div>
      )
   } else {
      return <Loading />
   }
}
