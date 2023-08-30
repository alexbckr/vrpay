import { useSession } from "next-auth/react"
import { prisma } from "../lib/prisma.js"
import styles from "../styles/Admin.module.css"
import Loading from "../components/Loading"
import { useState } from "react"
import {
   formatMoney,
   getRoleFormatting,
   deleteUser,
   approveTransactions,
} from "../utils.js"
import Router from "next/router.js"
import { Input, Button, Modal, Checkbox, useModal, Table, Text, Radio } from "@geist-ui/core"
import TransactionDetailsContent from "../components/TransactionDetailsContent"
import NewTransactionContent from "../components/NewTransactionContent"
import UserDetailsContent from "../components/UserDetailsContent"
import DeleteUserConfirmation from "../components/DeleteUserConfirmation"

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

   var total_owed = 0
   var length = Object.keys(verified_users).length
   for (var i = 0; i < length; i++) {
      if (verified_users[i].total_due > 0) {
         total_owed += verified_users[i].total_due
      }
   }

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
   console.log("total_owed:", total_owed)

   return { props: { unverified_users, verified_users, pending_transactions, total_owed } }
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
   const [state, setState] = useState('names')
   const [viewingDelete, setViewingDelete] = useState(false)
   const handler = val => {
      setState(val)
      console.log(val)
   }
   var checkedTransactions = []

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
               onClick={() => {
                  setViewingDelete(true)
                  setVisible(true)
                  setRelevantUser(rowData)
                  setViewingUser(true)
               }}
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

   const checkbox = (value, rowData, rowIndex) => {
      return (
         <Checkbox
            value={value}
            name={rowData?.id}
            onChange={(e) => {
               if (e.target.checked) {
                  // console.log('checked')
                  console.log(rowData?.id)
                  checkedTransactions.push(rowData?.id)
               } else {
                  // console.log('unchecked')
                  console.log(rowData?.id)
                  checkedTransactions = checkedTransactions.filter(id => id !== rowData?.id)
               }
               console.log(checkedTransactions)
            }}
         />
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
                  viewingDelete ? (
                     <DeleteUserConfirmation
                        user={relevantUser}
                        setVisible={setVisible}
                     />
                  ) : (
                  <UserDetailsContent
                     user={relevantUser}
                     setVisible={setVisible}
                  />
               )) : (
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
                        render={checkbox}
                        width="50px"
                     />
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
                  <br/>
                  <Button 
                     type='success' 
                     width='100px' 
                     onClick={() => {
                        console.log(checkedTransactions)
                        approveTransactions(checkedTransactions, session.user.name)
                     }}
                  >Approve</Button>
               </div>
            )}

            <h2 className={styles.sectionHeading}>Athletes</h2>
            <div className={styles.tableHeader}>
               <div className={styles.sortSection}>
                  <p className={styles.sortTitle}>Sort by</p>
                  <Radio.Group value={state} onChange={handler} scale={1 / 2}>
                     <Radio value="names">Name</Radio>
                     <Radio value="due">Total Due (descending)</Radio>
                     <Radio value="year">Grad Year</Radio>
                  </Radio.Group>
               </div>
               <div className={styles.sumFields}>
                  <p>Total owed to VRA: {formatMoney.format(props.total_owed)}</p>
               </div>
            </div>
            <Table auto data={state === "due" ? props.verified_users?.sort((a, b) => { return b.total_due - a.total_due })
               : state === "names" ? props.verified_users?.sort((a, b) => a.name.localeCompare(b.name)) : props.verified_users?.sort((a, b) => { return a.grad_year - b.grad_year })}>
               <Table.Column prop="name" label="Athlete" render={athleteName} width={width_name} />
               <Table.Column
                  prop="role"
                  label="Role"
                  render={athleteRole}
                  width={width_role}
                  className={styles.roleColumn}
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
      Router.push("/")
      return <Loading />
   }
}
