import React, { ChangeEvent, useState } from 'react'

const AddAccount: React.FC = () => {
  const [accountId, setAccountId] = useState('')
  const [accountName, setAccountName] = useState('')

  const addAccount = async () => {
    if (accountId.length > 0) {
      await window.electron.accountStore.add({
        accountId,
        accountName
      })
      setAccountId('')
      setAccountName('')
    }
  }

  const onChangeAccountId = (event: ChangeEvent<HTMLInputElement>) => {
    setAccountId(event.target.value)
  }

  const onChangeAccountName = (event: ChangeEvent<HTMLInputElement>) => {
    setAccountName(event.target.value)
  }

  return (
    <>
      <div className="p-2">
        <input className="w-full p-2" placeholder="Account Name" value={accountName} onChange={onChangeAccountName} />
      </div>
      <div className="p-2">
        <input className="w-full p-2" placeholder="Account Id" value={accountId} onChange={onChangeAccountId} />
      </div>
      <div className="p-2">
        <button className="w-full p-2 rounded border-solid border-2 border-gray-200" onClick={addAccount}>
          Add account
        </button>
      </div>
    </>
  )
}

export default AddAccount
