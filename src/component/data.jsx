const items = [
  {
    title: "tee-shirt",
    price: 19.99,
    description: "Un tee-shirt confortable en coton biologique.",
    img: "https://cdn.shopify.com/s/files/1/0070/7032/articles/Header_32797302-c39f-49b9-9778-8e4ccd073571.png?v=1758555216",
  },

  {
    title: "Sneakers",
    price: 89.99,
    description: "Des sneakers tendance pour un look décontracté.",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCMiVZVHzbwdnK88eoNu8pXHjK3KrymMg3Fg&s",
  },
  {
    title: "Veste en cuir",
    price: 129.99,
    description: "Une veste en cuir véritable pour un style audacieux.",
    img: "https://static.nike.com/a/images/f_auto,cs_srgb/w_960,c_limit/25bf48d1-6ad9-40e6-9692-d9766213d30e/comment-trouver-les-meilleures-chaussures-pour-pieds-larges.jpg",
  },
  {
    title: "Robe d'été",
    price: 39.99,
    description: "Une robe légère et colorée pour les journées chaudes.",
    img: "https://static.nike.com/a/images/q_auto:eco/t_product_v1/f_auto/dpr_3.0/h_300,c_limit/8d73cd25-91cc-48fe-9514-7a41daccb7ef/chaussure-de-running-sur-route-vomero-plus-pour-6fC359.png",
  },
  {
    title: "Montre élégante",
    price: 199.99,
    description: "Une montre sophistiquée pour toutes les occasions.",
    img: "https://www.parismatch.com/lmnr/r/960,640,FFFFFF,forcex,center-middle/img/var/pm/public/styles/paysage/public/media/image/2022/03/20/04/Les-dernieres-tendances-des-montres-pour-se-la-jouer-sport-chic.jpg?VersionId=2Zk2lkMg0qgsYqGZMLS6dQuH3kHAh4nD",
  },
  {
    title: "Lunettes de soleil",
    price: 79.99,
    description: "Des lunettes de soleil stylées pour protéger vos yeux.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Headphones_1.jpg/1200px-Headphones_1.jpg",
  },
  {
    title: "Chaussures de course",
    price: 99.99,
    description: "Des chaussures de course légères et confortables.",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCMiVZVHzbwdnK88eoNu8pXHjK3KrymMg3Fg&s",
  },
  {
    title: "T-shirt",
    price: 29.99,
    description: "Un t-shirt en coton biologique pour un look décontracté.",
    img: "https://cdor.fr/media/catalog/product/cache/d08ea8fe287bfecd2a2fac4a9f7b4ae7/202111/festina/F20285_3_P_1_f20285_3.jpg",
  },
  {
    title: "Sac à dos",
    price: 59.99,
    description:
      "Un sac à dos spacieux et durable pour vos aventures quotidiennes.",
    img: "https://cdor.fr/media/catalog/product/cache/d08ea8fe287bfecd2a2fac4a9f7b4ae7/202111/festina/F20285_3_P_1_f20285_3.jpg",
  },
  {
    title: "Lunettes de soleil",
    price: 79.99,
    description: "Des lunettes de soleil stylées pour protéger vos yeux.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Headphones_1.jpg/1200px-Headphones_1.jpg",
  },
  {
    title: "Chaussures de course",
    price: 99.99,
    description: "Des chaussures de course légères et confortables.",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCMiVZVHzbwdnK88eoNu8pXHjK3KrymMg3Fg&s",
  },
  {
    title: "Veste en cuir",
    price: 129.99,
    description: "Une veste en cuir véritable pour un style audacieux.",
    img: "https://static.nike.com/a/images/f_auto,cs_srgb/w_960,c_limit/25bf48d1-6ad9-40e6-9692-d9766213d30e/comment-trouver-les-meilleures-chaussures-pour-pieds-larges.jpg",
  },
  {
    title: "Robe d'été",
    price: 39.99,
    description: "Une robe légère et colorée pour les journées chaudes.",
    img: "https://static.nike.com/a/images/q_auto:eco/t_product_v1/f_auto/dpr_3.0/h_300,c_limit/8d73cd25-91cc-48fe-9514-7a41daccb7ef/chaussure-de-running-sur-route-vomero-plus-pour-6fC359.png",
  },
  {
    title: "Sac à dos",
    price: 59.99,
    description:
      "Un sac à dos spacieux et durable pour vos aventures quotidiennes.",
    img: "https://cdor.fr/media/catalog/product/cache/d08ea8fe287bfecd2a2fac4a9f7b4ae7/202111/festina/F20285_3_P_1_f20285_3.jpg",
  },
  {
    title: "Lunettes de soleil",
    price: 79.99,
    description: "Des lunettes de soleil stylées pour protéger vos yeux.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Headphones_1.jpg/1200px-Headphones_1.jpg",
  },
  {
    title: "Sac à dos",
    price: 59.99,
    description:
      "Un sac à dos spacieux et durable pour vos aventures quotidiennes.",
    img: "https://cdor.fr/media/catalog/product/cache/d08ea8fe287bfecd2a2fac4a9f7b4ae7/202111/festina/F20285_3_P_1_f20285_3.jpg",
  },
  {
    title: "Lunettes de soleil",
    price: 79.99,
    description: "Des lunettes de soleil stylées pour protéger vos yeux.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Headphones_1.jpg/1200px-Headphones_1.jpg",
  },
  {
    title: "Sac à dos",
    price: 59.99,
    description:
      "Un sac à dos spacieux et durable pour vos aventures quotidiennes.",
    img: "https://cdor.fr/media/catalog/product/cache/d08ea8fe287bfecd2a2fac4a9f7b4ae7/202111/festina/F20285_3_P_1_f20285_3.jpg",
  },
  {
    title: "Lunettes de soleil",
    price: 79.99,
    description: "Des lunettes de soleil stylées pour protéger vos yeux.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Headphones_1.jpg/1200px-Headphones_1.jpg",
  },
  {
    title: "Sac à dos",
    price: 59.99,
    description:
      "Un sac à dos spacieux et durable pour vos aventures quotidiennes.",
    img: "https://cdor.fr/media/catalog/product/cache/d08ea8fe287bfecd2a2fac4a9f7b4ae7/202111/festina/F20285_3_P_1_f20285_3.jpg",
  },
  {
    title: "Lunettes de soleil",
    price: 79.99,
    description: "Des lunettes de soleil stylées pour protéger vos yeux.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Headphones_1.jpg/1200px-Headphones_1.jpg",
  },
];
