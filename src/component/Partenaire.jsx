import React from 'react'

function Partenaire() {
  return (
   <>

         {/* Section Écoles */}
         <Box sx={{ py: 10, px: 2 }}>
           <Typography variant="h4" textAlign="center" sx={{ mb: 6 }}>
             Nos Écoles Partenaires
           </Typography>
           <Grid container spacing={2} sx={{ pb: 2 }}>
             {items.map((item, index) => (
               <Grid
                 sx={{
                   display: "flex",
                   justifyContent: "center",
                   mt: 2,
                   mx: "auto",
                   borderRadius: 2,
                 }}
                 minHeight={200}
                 size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                 key={item.id}
                 data-aos="fade-up"
                 data-aos-delay={index * 150}  
                 data-aos-duration="1000"
               >
                 <Card
                   sx={{
                     width: "100%",
                     boxShadow: 3,
                     overflow: "hidden",
                     borderRadius: 2,
                     bgcolor: "background.default",
                   }}
                 >
                   <CardMedia
                     component={motion.div}
                     initial={{ opacity: 0, y: 50 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -50 }}
                     whileHover={{ scale: 1.05 }}
                     transition={{ duration: 0.5 }}
                     sx={{ height: 160 }}
                     image={item.path}
                     name={item.name}
                   />
                   <Box sx={{ position: "relative" }}>
                     <CardContent sx={{ backgroundColor: "background.default" }}>
                       <Typography
                         gutterBottom
                         variant="h5"
                         component="div"
                         sx={{ color: colors.gray[100] }}
                       >
                         {item.name}
                       </Typography>
                       <Typography
                         variant="body2"
                         sx={{ color: colors.gray[100] }}
                       >
                         <Link
                           style={{
                             textDecoration: "none",
                             color: colors.gray[100],
                           }}
                         >
                           {item.description}
                         </Link>
                       </Typography>
                     </CardContent>
                   </Box>
                 </Card>
               </Grid>
             ))}
           </Grid>
         </Box>
   </>
  )
}

export default Partenaire
