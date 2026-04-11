import React from "react";

function UploadPhoto({ auth, Instance, setSuccess, ErrorGlobal, setError }) {
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file);

    try {
      const res = await Instance.post("/api/setting/photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        setSuccess("Photo mise à jour !");
        setTimeout(() => setSuccess(""), 3000);

         auth.user.photo = res.data.photo_url;
      }
    } catch (err) {
      ErrorGlobal({ error: err, setError });
    }
  };

  return (
    <Box sx={{ position: "relative" }}>
      <Avatar
        src={auth?.user?.photo}
        sx={{
          width: 140,
          height: 140,
          mb: 2,
          bgcolor: deepPurple[500],
          fontSize: 50,
          cursor: "pointer",
        }}
        onClick={() => fileInputRef.current.click()}
      >
        {formData.fullname.charAt(0)}
      </Avatar>
      <IconButton
        onClick={() => fileInputRef.current.click()}
        sx={{
          position: "absolute",
          bottom: 15,
          right: 5,
          bgcolor: "white",
          boxShadow: 2,
        }}
      >
        <PhotoCamera fontSize="small" color="primary" />
      </IconButton>
      <input type="file" ref={fileInputRef} hidden accept="image/*" />
    </Box>
  );
}

export default UploadPhoto;
