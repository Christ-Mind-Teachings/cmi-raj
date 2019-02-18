
const local_ports = {
  acim: 9912,
  wom: 9910,
  raj: 9913,
  jsb: 9911,
  www: 9999
};

const shareEndpoint = "https://rcd7l4adth.execute-api.us-east-1.amazonaws.com/latest/share";
const userEndpoint = "https://93e93isn03.execute-api.us-east-1.amazonaws.com/latest/user";

export default {
  sid: "Raj",
  ports: local_ports,
  share: shareEndpoint,
  user: userEndpoint
};
