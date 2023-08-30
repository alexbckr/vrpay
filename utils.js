import Router from "next/router"

export function toSentenceCase(str) {
   return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
   })
}

export function getDateFormatting(isoDate) {
   var date = new Date(isoDate)
   var year = date.getFullYear()
   var day = date.getDate()
   var month = date.getMonth() + 1
   return month + "/" + day + "/" + year
}

export const deleteUser = async (user_id) => {
   const body = { user_id }

   try {
      console.log(user_id)
      await fetch("/api/delete_user", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(body),
      }).then((res) => {
         Router.reload()
      })
   } catch (error) {
      console.log("error deleting user:", error)
   }
}

export const approveTransaction = async (trans_id, sessionName) => {
   const body = { trans_id, sessionName }

   try {
      await fetch("/api/approve_transaction", {
         method: "POST",
         headers: { "content-Type": "application/json" },
         body: JSON.stringify(body),
      }).then((res) => {
         Router.reload()
      })
   } catch (error) {
      console.log("error approving transaction:", error)
   }
}

export const deleteTransaction = async (trans_id) => {
   const body = { trans_id }

   try {
      await fetch("/api/delete_transaction", {
         method: "POST",
         headers: { "content-Type": "application/json" },
         body: JSON.stringify(body),
      }).then((res) => {
         Router.reload()
      })
   } catch (error) {
      console.log("error deleting transaction:", error)
   }
}

export const denyTransaction = async (trans_id) => {
   const body = { trans_id }

   try {
      console.log(trans_id)
      await fetch("/api/deny_transaction", {
         method: "POST",
         headers: { "content-Type": "application/json" },
         body: JSON.stringify(body),
      }).then((res) => {
         Router.reload()
         console.log("res", res)
      })
   } catch (error) {
      console.log("error denying transaction:", error)
   }
}

export const createTransactionForUser = async (
   uid,
   amount,
   type,
   description,
   applyTo,
   sessionName
) => {
   const body = { uid, amount, type, description, applyTo, sessionName }

   try {
      await fetch("/api/create_transaction_for_user", {
         method: "POST",
         headers: { "content-Type": "application/json" },
         body: JSON.stringify(body),
      }).then((res) => {
         console.log("res", res)
         Router.reload()
      })
   } catch (error) {
      console.log("error creating transaction:", error)
   }
}

export const approveTransactions = async (selectedTransactions, sessionName) => {
   const body = { selectedTransactions, sessionName }
   console.log("body", body)

   try {
      await fetch("/api/approve_transactions", {
         method: "POST",
         headers: { "content-Type": "application/json" },
         body: JSON.stringify(body),
      }).then((res) => {
         console.log("res", res)
         Router.reload()
      })
   } catch (error) {
      console.log("error approving transactions:", error)
   }
}

export const updateTransaction = async (transaction_id, amount, sessionName) => {
   const body = { transaction_id, amount, sessionName }
   console.log("body", body)

   try {
      await fetch("/api/update_transaction", {
         method: "POST",
         headers: { "content-Type": "application/json" },
         body: JSON.stringify(body),
      }).then((res) => {
         console.log("res", res)
         Router.reload()
      })
   } catch (error) {
      console.log("error updating transaction:", error)
   }
}

export const updateUser = async (user_id, name, gradYear, role, email) => {
   const body = { user_id, name, gradYear, role, email }

   try {
      await fetch("/api/update_user", {
         method: "POST",
         headers: { "content-Type": "application/json" },
         body: JSON.stringify(body),
      }).then((res) => {
         Router.reload()
      })
   } catch (error) {
      console.log("error updating user:", error)
   }
}

export const updateBalance = async (uid, amount) => {
   const body = { uid, amount }

   try {
      await fetch("/api/update_balance", {
         method: "POST",
         headers: { "content-Type": "application/json" },
         body: JSON.stringify(body),
      })
   } catch (error) {
      console.log("error updating balance:", error)
   }
}

export const updateUserRole = async (role, gradYear, email, uid) => {
   const body = { role, gradYear, email, uid }

   try {
      await fetch("/api/update_user_role", {
         method: "POST",
         headers: { "content-Type": "application/json" },
         body: JSON.stringify(body),
      }).then((res) => {
         // Router.reload()
      })
   } catch (error) {
      console.log("error updating user:", error)
   }
}

export var formatMoney = new Intl.NumberFormat("en-US", {
   style: "currency",
   currency: "USD",
   minimumFractionDigits: 0,
   maximumFractionDigits: 0,
})

export var sentenceCase = (str) => {
   return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
   })
}

// example call (for now):
// var dummyheaders = ["id", "name", "email", "total_due", "createdAt", "updatedAt"]
// var dummydata = props.verified_users
// exportCSVFile(dummyheaders, dummydata, "hello_world.csv")
export const exportCSVFile = (headers, items, fileTitle) => {
   if (headers) {
      items.unshift(headers)
   }

   // Convert Object to JSON
   var jsonObject = JSON.stringify(items)

   var csv = convertToCSV(jsonObject)

   var exportedFilenmae = fileTitle + ".csv" || "export.csv"

   var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
   if (navigator.msSaveBlob) {
      // IE 10+
      navigator.msSaveBlob(blob, exportedFilenmae)
   } else {
      var link = document.createElement("a")
      if (link.download !== undefined) {
         // feature detection
         // Browsers that support HTML5 download attribute
         var url = URL.createObjectURL(blob)
         link.setAttribute("href", url)
         link.setAttribute("download", exportedFilenmae)
         link.style.visibility = "hidden"
         document.body.appendChild(link)
         link.click()
         document.body.removeChild(link)
      }
   }
}

function convertToCSV(objArray) {
   var array = typeof objArray != "object" ? JSON.parse(objArray) : objArray
   var str = ""

   for (var i = 0; i < array.length; i++) {
      var line = ""
      for (var index in array[i]) {
         if (line != "") line += ","

         line += array[i][index]
      }

      str += line + "\r\n"
   }

   return str
}

export function getRoleFormatting(role, is_rookie) {
   var toReturn = ""

   // if (!role && !is_rookie) {
   //    return ""
   // }

   if (is_rookie) {
      toReturn += "Rookie "
   }
   if (role === "") {
      toReturn += "Athlete"
   }
   if (role === "admin") {
      toReturn += "Admin"
   }

   return toReturn
}

export function isNumeric(str) {
   if (typeof str != "string") return false // we only process strings!  
   return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

export function isTransactionValid(amount, type, description) {
   if (amount && isNumeric(amount) && type && description && amount < 20000 && amount > -20000) {
      return true
   } else {
      return false
   }
}

export function generateGradYears() {
   var min = new Date().getFullYear();
   var max = min + 5;
   var years = [];

   for (var i = max; i >= min; i--) {
      years.push(i);
   }

   var toReturn = [];
   for (var i in years) {
      toReturn.push({ id: years[i], name: years[i] });
   }

   return toReturn;
}