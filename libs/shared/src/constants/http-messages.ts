export const HTTPMessages = {
  user: {
    errors: {
      notFound: 'User not found by id',
      phoneAlreadyExist: 'Phone already exist',
      alreadyExist: 'User already exist',
      employeeNotFound: 'Employee not found by id',
      youCanBanYourself: "You can't ban yourself",
      youAreBanned: 'You are banned',
      pendingAccount: 'Tasdiqlanmagan foydalanuvchi',
      wrongPassword: 'Wrong password',
      alreadyDeleted: 'User already deleted',
      notFoundAuthTelegram: 'Auth user through telegram not found',
    },
  },
  operation: {
    errors: {
      alreadyExist: 'Operation already exist',
      alreadyCloused: 'Operation already cloused',
      notLendinger: 'You are not a lendinger',
      notContractor: 'You are not a contractor',
      notFound: 'Operation by id not found',
      notFoundOrDeleted: 'Operation by id not found or already deleted',
      notConfirm: 'Operation not confirm',
      refusal: 'Operation refusal',
      creatorConnotConfirm: 'Operation creator connot confirm',
      contractorBanned:
        'You cannot create an operation for a given user whose number of bans has exceeded the limit',
    },
  },
  transaction: {
    errors: {
      notFound: 'Transaction by id not found',
      connotConfirmAlreadyRefusal: 'Cannot confirm already rejected',
      connotRefusalAlreadyConfirm: 'Cannot refusal already confirmed',
      onlyLendingerConirm: 'Transaction only lendinger confirm',
    },
  },
  userContact: {
    errors: {
      youAlreadyAdd: 'You have already added',
    },
  },
  notification: {
    errors: {
      notFound: 'User notification by id not found',
    },
  },
  errorLog: {
    errors: {
      notFound: 'Error log by id not found',
    },
  },
};
