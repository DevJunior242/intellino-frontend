import React, { useState } from "react";
import { Bell } from "lucide-react";
import SettingSection from "./SettingSection";
import ToggleSwitch from "../../ToggleSwitch";

function Nof() {
  const [Notifications, setNotification] = useState({
    push: true,
    email: false,
    sms: true,
  });
  return (
    <SettingSection title={"notifications"} icon={Bell}>
      <ToggleSwitch
        label={"push notifications"}
        isOn={Notifications.push}
        onToggle={() =>
          setNotification({ ...Notifications, push: !Notifications.push })
        }
      />
      <ToggleSwitch
        label={"email notifications"}
        isOn={Notifications.email}
        onToggle={() =>
          setNotification({ ...Notifications, email: !Notifications.email })
        }
      />
      <ToggleSwitch
        label={"sms notifications"}
        isOn={Notifications.sms}
        onToggle={() =>
          setNotification({ ...Notifications, sms: !Notifications.sms })
        }
      />
    </SettingSection>
  );
}

export default Nof;
