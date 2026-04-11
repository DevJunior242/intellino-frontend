const getStatusColor = (status) => {
  switch (status) {
    case "paid":
      return "success";
    case "pending_payment":
      return "warning";
    case "expired":
      return "error";
    default:
      return "default";
  }
};

export default getStatusColor;
