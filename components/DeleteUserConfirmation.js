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

export default function DeleteUserConfirmation(props) {
    return (
        <div>
            <Modal.Title style={{ textTransform: "None" }}>
                Are you sure you want to delete {props?.user?.name ? props.user.name : "no name"} with outstanding balance 
                ${props?.user?.total_due}?
            </Modal.Title>
            <div className={styles.inputSection}>
                <div className={styles.actions}>
                    <Button
                        onClick={() => {deleteUser(props.user.id)}}
                        type="error"
                        style={{ width: "100%" }}
                    >
                        Delete
                    </Button>
                    <Button
                        onClick={() => props.setVisible(false)}
                        style={{ width: "100%" }}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    )
}