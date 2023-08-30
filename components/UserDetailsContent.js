import styles from "../styles/Overlays.module.css"
import { useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { Input, Button, Modal, Select } from "@geist-ui/core"
import {
   formatMoney,
   getDateFormatting,
   approveTransaction,
   isTransactionValid,
   deleteUser,
   updateUser,
   getRoleFormatting,
} from "../utils"
import Router from "next/router"

export default function UserDetailsContent(props) {
   const { data: session, status } = useSession()
   const [name, setName] = useState(props.user.name)
   const [gradYear, setGradYear] = useState(props.user.grad_year)
   const [email, setEmail] = useState(props.user.email)
   const [role, setRole] = useState(props.user.role)
   
   return (
      <div
         className={styles.container}
      >
         <div className={styles.container}>
            <Modal.Title style={{ textTransform: "None" }}>
               Editing {props?.user?.name ? props.user.name : "no name"}
            </Modal.Title>
            <div>
                <div className={styles.inputSection}>
                <div className={styles.inputGroup}>
                    <Input
                        className={styles.formInput}
                        onChange={(e) => setName(e.target.value)}
                        initialValue={props?.user?.name}
                        width={"100%"}
                     >
                        <b>Name</b>
                     </Input>
                </div>
                <div className={styles.inputGroup}>
                    <b className={styles.label}>Role</b>
                    {/* <p>{getRoleFormatting(props?.user?.role)}</p> */}
                    {/* Radio button for Rookie/Varsity */}
                     <Select
                        placeholder={props?.user?.is_rookie ? "Rookie" : "Varsity"}
                        width={"100%"}
                        initialValue={props?.user?.role}
                        onChange={(e) => setRole(e)}
                     >
                        <Select.Option value="true">Rookie</Select.Option>
                        <Select.Option value="false">Varsity</Select.Option>
                     </Select>
                </div>
                <div className={styles.inputGroup}>
                    <Input
                        className={styles.formInput}
                        onChange={(e) => setGradYear(e.target.value)}
                        initialValue={props?.user?.grad_year}
                        width={"100%"}
                     >
                        <b>Grad Year</b>
                     </Input>
                </div>
                </div>
                <div className={styles.inputSection}>
                <div className={styles.inputGroup}>
                    <Input
                        className={styles.formInput}
                        onChange={(e) => setEmail(e.target.value)}
                        initialValue={props?.user?.email}
                        width={"100%"}
                     >
                        <b>Email</b>
                     </Input>
                </div>
                </div>
            </div>

            <div className={styles.actions}>
                  <div>
                     <Button
                        auto
                        type="abort"
                        onClick={() => {
                           props.setVisible(false)
                        }}
                     >
                        Cancel
                     </Button>
                     <Button
                        auto
                        type={"success"}
                        onClick={() => {
                              updateUser(props?.user?.id, name, gradYear, role, email)
                        }}
                        disabled={props?.user?.name == name && props?.user?.grad_year == gradYear && props?.user?.role == role && props?.user?.email == email}
                     >
                        Save
                     </Button>
                  </div>
            </div>
         </div>
      </div>
   )
}
