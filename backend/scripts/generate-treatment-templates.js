const fs = require("node:fs/promises");
const path = require("node:path");
const {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} = require("docx");

const OUTPUT = path.resolve(__dirname, "../data/treatment-templates");
const DISCLAIMER = "Tài liệu tham khảo để AI tạo bản nháp; không thay thế chẩn đoán chuyên môn hoặc nhãn thuốc đăng ký tại địa phương.";

const sources = {
  apple: ["UC IPM – Apple scab", "https://ipm.ucanr.edu/agriculture/apple/apple-scab/"],
  appleVirus: ["Penn State Extension – Apple viruses", "https://extension.psu.edu/apple-viruses"],
  appleBlackRot: ["Penn State Extension – Apple black rot", "https://extension.psu.edu/pome-fruit-disease-black-rot-and-frogeye-leaf-spot"],
  banana: ["UF/IFAS Extension – Banana growing and Panama disease", "https://ask.ifas.ufl.edu/publication/MG040"],
  basil: ["University of Minnesota Extension – Basil downy mildew", "https://extension.umn.edu/agriculture/specialty-crops/vegetable-farming/disease-management/basil-downy-mildew"],
  bean: ["Cornell Vegetables – Bacterial diseases of beans", "https://www.vegetables.cornell.edu/pest-management/disease-factsheets/bacterial-diseases-of-beans/"],
  vegetable: ["Cornell Vegetables – Disease factsheets", "https://www.vegetables.cornell.edu/pest-management/disease-factsheets/"],
  corn: ["University of Minnesota Extension – Corn pest management", "https://extension.umn.edu/corn/corn-pest-management"],
  cucurbitDowny: ["Cornell Vegetables – Cucurbit downy mildew", "https://www.vegetables.cornell.edu/crops/cucurbits/downy-mildew/"],
  cucurbitPowdery: ["Cornell Vegetables – Cucurbit powdery mildew", "https://www.vegetables.cornell.edu/pest-management/disease-factsheets/cucurbit-powdery-mildew/"],
  potatoEarly: ["University of Minnesota Extension – Early blight", "https://extension.umn.edu/agriculture/specialty-crops/vegetable-farming/disease-management/early-blight-in-tomato-and-potato"],
  potatoLate: ["University of Minnesota Extension – Late blight", "https://extension.umn.edu/agriculture/specialty-crops/vegetable-farming/disease-management/late-blight"],
  strawberry: ["University of Minnesota Extension – Strawberry diseases", "https://extension.umn.edu/agriculture/specialty-crops/commercial-fruit-production/strawberry-farming/strawberry-diseases-in-minnesota"],
  stoneLeaf: ["University of Minnesota Extension – Cherry leaf spot", "https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/yard-and-garden-problems/cherry-leaf-spot"],
  peach: ["UC IPM – Peach leaf curl", "https://ipm.ucanr.edu/agriculture/peach/peach-leaf-curl/"],
  maple: ["University of Minnesota Extension – Maple leaf spots", "https://apps.extension.umn.edu/garden/diagnose/plant/deciduous/maple/leavesspots.html"],
  riceBlast: ["American Phytopathological Society – Rice blast", "https://www.apsnet.org/edcenter/pdlessons/Pages/RiceBlast.aspx"],
  riceSheath: ["American Phytopathological Society – Rice sheath blight", "https://www.apsnet.org/edcenter/pdlessons/Pages/RiceSheath.aspx"],
  tobacco: ["American Phytopathological Society – Tobacco mosaic virus", "https://www.apsnet.org/edcenter/pdlessons/Pages/TobaccoMosaic.aspx"],
  citrus: ["UF/IFAS Extension – Citrus greening FAQ", "https://gardeningsolutions.ifas.ufl.edu/care/pests-and-diseases/diseases/citrus-greening-faq/"],
  carrot: ["UC IPM – Carrot cavity spot", "https://ipm.ucanr.edu/home-and-landscape/cavity-spot/"],
  coffee: ["University of Hawai‘i CTAHR – Coffee leaf rust monitoring", "https://www.ctahr.hawaii.edu/oc/freepubs/pdf/PD-125.pdf"],
  grape: ["University of Minnesota Extension – Grapevine mildew management", "https://enology.umn.edu/grapes-how/post-harvest-disease-management-grapevine-downy-mildew-and-powdery-mildew"],
  plum: ["University of Arkansas Extension – Plum pockets", "https://www.uaex.uada.edu/yard-garden/plant-health-clinic/disease-notes/posts/plum-pockets.aspx"],
  raspberry: ["University of Minnesota Extension – Raspberry diseases", "https://extension.umn.edu/agriculture/specialty-crops/commercial-fruit-production/raspberry-farming/raspberry-diseases"],
};

const plants = [
  ["Táo", "tao", [["Thối đen", "fungal", "appleBlackRot"], ["Khảm lá do virus", "virus", "appleVirus"], ["Gỉ sắt", "fungal", "apple"], ["Ghẻ táo", "fungal", "apple"]]],
  ["Chuối", "chuoi", [["Héo Panama", "soil", "banana"]]],
  ["Húng quế", "hung-que", [["Sương mai", "downy", "basil"]]],
  ["Đậu", "dau", [["Đốm lá quầng", "bacterial", "bean"], ["Khảm lá do virus", "virus", "bean"], ["Gỉ sắt", "fungal", "bean"]]],
  ["Ớt chuông", "ot-chuong", [["Đốm lá vi khuẩn", "bacterial", "vegetable"]]],
  ["Súp lơ xanh", "sup-lo-xanh", [["Sương mai", "downy", "vegetable"]]],
  ["Cà rốt", "ca-rot", [["Đốm lõm củ (cavity spot)", "soil", "carrot"]]],
  ["Cần tây", "can-tay", [["Đốm lá sớm (early blight)", "fungal", "vegetable"]]],
  ["Anh đào", "anh-dao", [["Đốm lá", "fungal", "stoneLeaf"], ["Phấn trắng", "powdery", "stoneLeaf"]]],
  ["Cây có múi", "cay-co-mui", [["Loét/ghẻ", "bacterial", "citrus"], ["Vàng lá gân xanh (greening/HLB)", "incurable", "citrus"]]],
  ["Cà phê", "ca-phe", [["Gỉ sắt lá", "fungal", "coffee"]]],
  ["Ngô", "ngo", [["Đốm lá xám", "fungal", "corn"], ["Đốm lá lớn", "fungal", "corn"], ["Gỉ sắt", "fungal", "corn"], ["Bệnh than", "fungal", "corn"]]],
  ["Dưa chuột", "dua-chuot", [["Đốm lá góc cạnh", "bacterial", "vegetable"], ["Bệnh thán", "fungal", "vegetable"], ["Phấn trắng", "powdery", "cucurbitPowdery"], ["Sương mai", "downy", "cucurbitDowny"]]],
  ["Cà tím", "ca-tim", [["Đốm lá Cercospora", "fungal", "vegetable"]]],
  ["Tỏi", "toi", [["Cháy lá", "fungal", "vegetable"], ["Gỉ sắt", "fungal", "vegetable"]]],
  ["Nho", "nho", [["Thối đen", "fungal", "grape"], ["Sương mai", "downy", "grape"], ["Phấn trắng", "powdery", "grape"]]],
  ["Xà lách", "xa-lach", [["Sương mai", "downy", "vegetable"], ["Khảm lá do virus", "virus", "vegetable"]]],
  ["Phong", "phong", [["Đốm hắc ín (tar spot)", "fungal", "maple"]]],
  ["Đào", "dao", [["Xoăn lá", "fungal", "peach"]]],
  ["Mận", "man", [["Phồng quả (plum pocket)", "fungal", "plum"]]],
  ["Khoai tây", "khoai-tay", [["Đốm vòng/early blight", "fungal", "potatoEarly"], ["Mốc sương/late blight", "downy", "potatoLate"]]],
  ["Mâm xôi", "mam-xoi", [["Theo dõi cây khỏe", "healthy", "raspberry"]]],
  ["Lúa", "lua", [["Đạo ôn", "fungal", "riceBlast"], ["Khô vằn", "fungal", "riceSheath"]]],
  ["Đậu tương", "dau-tuong", [["Theo dõi cây khỏe", "healthy", "bean"]]],
  ["Bí", "bi", [["Phấn trắng", "powdery", "cucurbitPowdery"]]],
  ["Dâu tây", "dau-tay", [["Thán thư", "fungal", "strawberry"], ["Cháy lá", "fungal", "strawberry"]]],
  ["Thuốc lá", "thuoc-la", [["Khảm lá do virus", "virus", "tobacco"]]],
  ["Cà chua", "ca-chua", [["Đốm lá vi khuẩn", "bacterial", "vegetable"], ["Đốm vòng/early blight", "fungal", "potatoEarly"], ["Mốc sương/late blight", "downy", "potatoLate"], ["Mốc lá", "fungal", "vegetable"], ["Khảm lá do virus", "virus", "tobacco"], ["Đốm lá Septoria", "fungal", "vegetable"]]],
  ["Bí ngòi", "bi-ngoi", [["Khảm vàng do virus", "virus", "cucurbitPowdery"]]],
];

const plans = {
  fungal: ["Chụp ảnh, đánh dấu lá/quả bị bệnh và kiểm tra cả mặt dưới lá.", "Tỉa bỏ mô bệnh nặng bằng dụng cụ sạch; bỏ riêng, không ủ tại vườn.", "Tưới vào gốc buổi sáng, tránh làm ướt tán; tăng thông thoáng.", "Thu gom lá rụng và vệ sinh bề mặt chậu/khu trồng.", "Kiểm tra lá non và vùng tán thấp; ghi nhận số vết mới.", "Nếu bệnh tiếp tục lan, hỏi cán bộ bảo vệ thực vật về sản phẩm đăng ký cho đúng cây/bệnh.", "Đánh giá lại; tiếp tục vệ sinh và cách ly nếu còn vết mới."],
  powdery: ["Xác nhận lớp phấn trên cả hai mặt lá và đánh dấu lá bệnh.", "Tỉa lá bệnh nặng, giữ khoảng cách và lưu thông không khí.", "Tưới gốc, tránh dư đạm và tán quá rậm.", "Kiểm tra lá già, lá thấp và mặt dưới lá.", "Vệ sinh lá rụng, dụng cụ và khu vực trồng.", "Nếu lan rộng, tra nhãn sản phẩm đăng ký và luân phiên nhóm tác động theo tư vấn địa phương.", "Đánh giá tỷ lệ lá mới có triệu chứng."],
  downy: ["Kiểm tra vào sáng sớm khi còn ẩm; quan sát mặt dưới lá.", "Loại bỏ lá/cây bệnh nặng và cách ly khỏi cây khỏe.", "Tưới gốc buổi sáng; giảm thời gian lá ướt và tăng thông thoáng.", "Theo dõi thời tiết ẩm mát và kiểm tra vết bệnh mới.", "Vệ sinh tàn dư, chậu và dụng cụ.", "Nếu nguy cơ cao, hỏi chuyên gia về sản phẩm phòng bệnh đăng ký; tuân thủ nhãn.", "Đánh giá lại và tiếp tục cách ly nếu bệnh còn lan."],
  bacterial: ["Đánh dấu vết ướt nước/đốm có quầng và hạn chế chạm cây khi lá ướt.", "Loại bỏ mô bệnh nặng bằng dụng cụ đã khử khuẩn.", "Ngừng tưới phun; tưới gốc buổi sáng và tăng thông thoáng.", "Khử khuẩn dụng cụ, tay và bề mặt tiếp xúc giữa các cây.", "Kiểm tra cây lân cận và cách ly cây có triệu chứng.", "Không dùng thuốc kháng sinh tùy ý; hỏi chuyên gia về sản phẩm được đăng ký.", "Đánh giá vết mới và tiếp tục vệ sinh/cách ly."],
  virus: ["Cách ly cây nghi nhiễm; không nhân giống hoặc lấy hạt/cành từ cây bệnh.", "Chụp ảnh và kiểm tra cây lân cận, cỏ dại và côn trùng môi giới.", "Rửa tay, khử khuẩn kéo/dụng cụ; tránh thao tác cây khỏe sau cây bệnh.", "Loại bỏ cây bệnh nặng theo hướng dẫn địa phương; không ủ tàn dư.", "Kiểm soát cỏ ký chủ và môi giới bằng biện pháp IPM phù hợp.", "Theo dõi cây còn lại; virus không có thuốc chữa cho mô đã nhiễm.", "Đánh giá lại khu trồng và chỉ dùng vật liệu giống sạch bệnh."],
  soil: ["Cách ly khu vực/cây nghi nhiễm và xác nhận triệu chứng ở rễ, củ hoặc mạch dẫn.", "Không di chuyển đất, nước, chậu hoặc vật liệu giống sang khu sạch.", "Khử khuẩn dụng cụ và quản lý thoát nước; tránh úng.", "Loại bỏ cây/tàn dư bệnh nặng theo hướng dẫn địa phương.", "Kiểm tra cây lân cận và ghi nhận tiến triển héo/thối.", "Không tự dùng hóa chất xử lý đất; hỏi chuyên gia về xét nghiệm và luân canh.", "Đánh giá nguy cơ; dùng giống/vật liệu sạch bệnh cho vụ sau."],
  incurable: ["Cách ly cây nghi nhiễm và liên hệ cơ quan/extension địa phương để xác nhận.", "Không chuyển cành, mắt ghép, đất hoặc cây giống ra khỏi khu vực.", "Theo dõi cây lân cận và côn trùng môi giới; ghi nhận bằng ảnh.", "Vệ sinh dụng cụ và không nhân giống từ cây nghi nhiễm.", "Thực hiện kiểm soát môi giới theo IPM và quy định địa phương.", "Không dùng sản phẩm quảng cáo chữa khỏi khi chưa có bằng chứng/đăng ký.", "Nếu xác nhận bệnh, xử lý cây theo hướng dẫn kiểm dịch; dùng giống sạch bệnh."],
  healthy: ["Quan sát tổng thể màu lá, chồi, thân và độ ẩm đất.", "Kiểm tra mặt dưới lá, gốc và tán trong; không thấy triệu chứng thì không xử lý thuốc.", "Tưới theo nhu cầu đất, tránh úng và tránh làm ướt tán kéo dài.", "Vệ sinh lá rụng và dụng cụ chăm sóc.", "Kiểm tra sâu bệnh và dấu hiệu bất thường mới.", "Ghi ảnh so sánh, không bón/phun phòng tùy tiện.", "Đánh giá lại; tiếp tục chăm sóc bình thường nếu cây ổn định."],
};

// Giờ được chọn theo bản chất công việc: tưới/quan sát bệnh ưa ẩm vào sáng sớm,
// cắt tỉa và vệ sinh khi tán đã khô, đánh giá cuối ngày khi nhiệt độ dịu.
const schedules = {
  fungal: ["06:30", "09:15", "06:15", "16:45", "06:45", "14:30", "17:15"],
  powdery: ["07:30", "09:30", "06:30", "16:30", "09:00", "14:00", "17:00"],
  downy: ["05:45", "09:30", "06:00", "17:00", "10:00", "14:30", "06:15"],
  bacterial: ["08:30", "10:00", "06:15", "15:30", "08:00", "14:00", "17:15"],
  virus: ["08:00", "16:30", "09:30", "10:30", "07:00", "17:00", "08:30"],
  soil: ["07:00", "09:00", "16:00", "10:00", "07:30", "14:00", "17:00"],
  incurable: ["08:00", "09:30", "16:30", "10:00", "07:30", "14:30", "08:30"],
  healthy: ["06:45", "16:30", "06:15", "09:30", "17:00", "08:00", "16:45"],
};

const phases = [
  "Khảo sát và khoanh vùng",
  "Loại bỏ nguồn bệnh",
  "Điều chỉnh chăm sóc",
  "Vệ sinh và ngăn lây lan",
  "Theo dõi đáp ứng",
  "Ra quyết định xử lý tiếp",
  "Đánh giá cuối đợt",
];

const evidence = [
  "Chụp ảnh cùng một góc, ghi số lá/cây có triệu chứng và phạm vi đang bị ảnh hưởng.",
  "Ghi rõ bộ phận đã loại bỏ, cho vào túi riêng và kiểm tra cây sau thao tác.",
  "Ghi độ ẩm đất, tình trạng thoát nước và thời gian tán lá khô sau chăm sóc.",
  "Đánh dấu cây đã vệ sinh; không dùng chung dụng cụ khi chưa khử khuẩn.",
  "So sánh với ảnh ngày 1, đếm vết mới và ghi mức lan: giảm, ổn định hay tăng.",
  "Ghi quyết định tiếp tục theo dõi hoặc liên hệ chuyên gia; không tự tăng liều hay trộn thuốc.",
  "Tổng hợp ảnh và số liệu 7 ngày; nếu còn vết mới, tiếp tục cách ly và xin chẩn đoán chuyên môn.",
];

const safetyByKind = {
  fungal: "Chỉ thao tác khi lá tương đối khô; đeo găng, khử khuẩn kéo trước và sau mỗi cây.",
  powdery: "Tránh làm phát tán lớp bào tử; cho lá bệnh vào túi kín và rửa tay sau xử lý.",
  downy: "Không làm việc giữa các luống khi lá còn ướt; tránh tưới phun lên tán.",
  bacterial: "Không chạm hoặc cắt cây khi lá ướt; khử khuẩn dụng cụ giữa từng cây.",
  virus: "Xử lý cây khỏe trước, cây nghi nhiễm sau; không dùng lại vật liệu nhân giống từ cây bệnh.",
  soil: "Không chuyển đất, nước chảy, chậu hay dụng cụ bám đất từ vùng bệnh sang vùng sạch.",
  incurable: "Giữ nguyên cách ly và tuân thủ hướng dẫn kiểm dịch/cơ quan chuyên môn địa phương.",
  healthy: "Không phun thuốc phòng khi chưa có dấu hiệu hoặc khuyến cáo chuyên môn rõ ràng.",
};

const paragraph = (text, options = {}) => new Paragraph({ text, ...options });
const dayParagraphs = (kind) => plans[kind].flatMap((instruction, index) => [
  new Paragraph({ children: [new TextRun({
    text: `Ngày ${index + 1} – ${schedules[kind][index]} – ${phases[index]}`,
    bold: true,
  })] }),
  paragraph(`Mục tiêu ngày: ${phases[index]}.`),
  paragraph(`Cách thực hiện: ${instruction}`),
  paragraph(`Kết quả cần ghi nhận: ${evidence[index]}`),
  paragraph(`An toàn: ${safetyByKind[kind]} Mọi thuốc/hoạt chất phải đúng nhãn, đúng cây, đúng bệnh, đúng liều và thời gian cách ly tại địa phương.`),
]);

async function createPlantDocument([plant, slug, diseases]) {
  const children = [
    paragraph(`MẪU PHÁC ĐỒ THAM KHẢO – ${plant.toUpperCase()}`, { heading: HeadingLevel.TITLE }),
    paragraph(DISCLAIMER),
    paragraph("Cách dùng: trong Plantify, chọn đúng cây và đúng bệnh rồi tải file này. AI sẽ ưu tiên mục có tên bệnh tương ứng."),
  ];
  for (const [disease, kind, sourceKey] of diseases) {
    const [sourceName, sourceUrl] = sources[sourceKey];
    children.push(
      paragraph(`Bệnh: ${disease}`, { heading: HeadingLevel.HEADING_1 }),
      paragraph(`Cây áp dụng: ${plant}`),
      paragraph("Thời lượng mẫu: 7 ngày"),
      paragraph("Mục tiêu: hạn chế phát tán, cải thiện điều kiện chăm sóc, theo dõi đáp ứng và chuyển chuyên gia khi bệnh tiếp tục tiến triển."),
      paragraph("Nguyên tắc thời gian: quan sát/tưới vào sáng sớm; cắt tỉa, vệ sinh khi tán khô; đánh giá vào chiều mát. Có thể điều chỉnh theo mưa, nhiệt độ và điều kiện vườn nhưng không tưới làm ướt tán vào ban đêm."),
      paragraph("Lịch thực hiện", { heading: HeadingLevel.HEADING_2 }),
      ...dayParagraphs(kind),
      paragraph("Nguồn tham khảo", { heading: HeadingLevel.HEADING_2 }),
      paragraph(sourceName),
      paragraph(sourceUrl),
    );
  }
  const document = new Document({ sections: [{ children }] });
  await fs.writeFile(path.join(OUTPUT, `${slug}.docx`), await Packer.toBuffer(document));
}

async function main() {
  await fs.mkdir(OUTPUT, { recursive: true });
  await Promise.all(plants.map(createPlantDocument));
  await fs.writeFile(path.join(OUTPUT, "README.txt"), [
    "Plantify treatment DOCX templates",
    `Generated files: ${plants.length}`,
    DISCLAIMER,
    "Regenerate: node backend/scripts/generate-treatment-templates.js",
  ].join("\n"), "utf8");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
