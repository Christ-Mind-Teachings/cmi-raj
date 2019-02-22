
/*
  Modify navigation links to localhost when running in development
*/
function setLinks() {
  if (location.hostname === "localhost") {
    //for masthead and cmi-www:index.md
    $(".href.www-christmind-info").attr("href", `http://localhost:${local_ports.www}/`);
    $(".href.acim-christmind-info").attr("href", `http://localhost:${local_ports.acim}/`);
    $(".href.wom-christmind-info").attr("href", `http://localhost:${local_ports.wom}/`);
    $(".href.raj-christmind-info").attr("href", `http://localhost:${local_ports.raj}/`);
    $(".href.jsb-christmind-info").attr("href", `http://localhost:${local_ports.jsb}/`);

    //for quick link menu
    $(".dhref.www-christmind-info").attr("data-href", `http://localhost:${local_ports.www}/`);
    $(".dhref.acim-christmind-info").attr("data-href", `http://localhost:${local_ports.acim}/`);
    $(".dhref.wom-christmind-info").attr("data-href", `http://localhost:${local_ports.wom}/`);
    $(".dhref.raj-christmind-info").attr("data-href", `http://localhost:${local_ports.raj}/`);
    $(".dhref.jsb-christmind-info").attr("data-href", `http://localhost:${local_ports.jsb}/`);
  }
}

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
  user: userEndpoint,
  setLinks: setLinks
};
