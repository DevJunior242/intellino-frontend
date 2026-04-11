import { Typography, Box } from "@mui/material";
 import Logout from "../../Api/Logout";
 
import { UseAuth } from "../../Api/AuthContext";

function Account() {

  const { user, setUser, logout } = UseAuth();

  console.log(user);
  // const [user, setUser] = useState(null);
  // const navigate = useNavigate();
  // useEffect(() => {
  //   const userInfos = JSON.parse(localStorage.getItem("user"));
  //   if (userInfos) {
  //     Instance.get("api/check-user")
  //       .then(() => setUser(userInfos.user))
  //       .catch(() => {
  //         localStorage.removeItem("user");
  //         setUser(null);
  //         navigate("/login");
  //       });
  //   } else {
  //     navigate("/login");
  //   }
  // }, [user, navigate]);

  // if (!user) return <div>Loading...</div>;
  return (
    <Box>
      <Typography variant="h4" component={"h1"} textAlign={"center"}>
        {user.name}
      </Typography>
      <Typography variant="h4" component={"h1"} textAlign={"center"}>
        {user.email}
      </Typography>
      <Logout />
    </Box>
  );
}

export default Account;
