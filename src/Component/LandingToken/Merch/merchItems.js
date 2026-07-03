export const merchItems = [
  {
    id: 1,
    title: "KHS T-shirt",
    cost: "",
    size: "Free size",
    color: "Black / Amber",
    description: "Хөнгөн, өдөр тутмын хэрэглээнд зориулсан подволк.",
    longDescription:
      "Өдөр тутмын хөдөлгөөнд хөнгөхөн мэдрэмж өгөх, байгууллагын өнгө төрхийг илэрхийлэх KHS малгай. Амьсгалдаг материалтай тул урт хугацаанд өмсөхөд тав тухтай.",
    features: ["Хөнгөн материал", "Амьсгалдаг бүтэц", "Өдөр тутмын стиль"],
    redeemSteps: [
      "Card дээр дарж бүтээгдэхүүнээ сонгоно",
      "Сагсанд нэмээд Token-оор төлбөрөө баталгаажуулна",
      "Агуулахаас авах эсвэл хүргэлтээ сонгоно",
    ],
    imageUrl:
      "https://res.cloudinary.com/hfroefns/image/upload/v1782976073/b7a98308-42af-4142-80e5-50d0615b7134_kgvv1p.jpg",
  },
  {
    id: 2,
    title: "KHS Hoodie",
    cost: "",
    size: "M, L, XL",
    color: "Cream / Charcoal",
    description: "Зөөлөн дотортой, байгууллагын өнгө төрхтэй цамц.",
    longDescription:
      "Team Hoodie нь дотор зөөлөвчтэй, сэрүүн улиралд дулаан хадгалах бүтэцтэй. Багийн эв нэгдлийг илэрхийлэх минимал лого болон цэвэр эсгүүртэй.",
    features: ["Дулаан барина", "Зөөлөн дотор", "Багийн өнгө төрх"],
    redeemSteps: [
      "Хэмжээгээ сонгоод card дээр дарна",
      "Token дүнгээ шалгаад баталгаажуулна",
      "Ажлын байран дээр хүлээн авна",
    ],
    imageUrl:
      "https://res.cloudinary.com/hfroefns/image/upload/v1782976073/3a98925c-2bc6-44a4-aad2-d04660f83387_kkdm3v.jpg",
  },
  {
    id: 3,
    title: "Travel Mug",
    cost: "",
    size: "450 ml",
    color: "White / Orange",
    description: "Халуун, хүйтэн ундааны температурыг удаан хадгална.",
    longDescription:
      "Travel Mug нь халуун болон хүйтэн ундааны температурыг удаан барих давхар ханатай шийдэлтэй. Ажил дээр, замд, уулзалт хооронд авч явахад тохиромжтой.",
    features: ["Температур хадгалалт", "Давхар ханатай", "Авахад эвтэйхэн"],
    redeemSteps: [
      "Маг-аа сонгон card дээр дарна",
      "Token-оор солих хүсэлтээ баталгаажуулна",
      "Бэлэн болсон үед мэдэгдэл хүлээн авна",
    ],
    imageUrl:
      "https://res.cloudinary.com/hfroefns/image/upload/v1782976073/4f403e04-e128-4193-bd8a-9bc32f9fe070_okwfvy.jpg",
  },
  {
    id: 4,
    title: "Travel Mug",
    cost: "",
    size: "A5 Set",
    color: "Ivory / Sand",
    description: "Халуун, хүйтэн ундааны температурыг удаан хадгална.",
    longDescription: "Халуун, хүйтэн ундааны температурыг удаан хадгална.",
    features: ["A5 хэмжээ", "Өдөр тутмын тэмдэглэл", "Цэвэр минимал дизайн"],
    redeemSteps: [
      "Бүтээгдэхүүнээ сонгоод card дээр дарна",
      "Token үлдэгдлээ баталгаажуулж захиална",
      "Хүргэлт эсвэл биеэр авах аргаа сонгоно",
    ],
    imageUrl:
      "https://res.cloudinary.com/hfroefns/image/upload/v1782976073/bb15f46d-6a9c-421f-8866-0bbff9166504_lcjgjj.jpg",
  },
];

export function getMerchById(id) {
  const merchId = Number(id);
  return merchItems.find((item) => item.id === merchId);
}
