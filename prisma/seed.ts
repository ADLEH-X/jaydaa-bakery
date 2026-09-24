import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedDatabase() {
  console.log('Clearing existing data...');
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.recipeIngredient.deleteMany({});
  await prisma.recipe.deleteMany({});
  await prisma.rawMaterial.deleteMany({});
  await prisma.cafe.deleteMany({});

  console.log('Seeding authentic raw materials...');
  const materialsData = [
  {
    "id": "cmucxmsh3000012p8shqoo0nq",
    "name": "Fresh Eggs (Migros 30 Pcs)",
    "category": "INGREDIENT",
    "purchaseQuantity": 30,
    "purchaseUnit": "pcs",
    "purchaseCost": 170,
    "unitCost": 5.666666666666667,
    "updatedAt": "2026-09-22T17:12:44.967Z",
    "createdAt": "2026-09-22T17:12:44.967Z"
  },
  {
    "id": "cmucxmshf000112p8lmi7ccgy",
    "name": "Vanilla (Dr. Oetker 50g)",
    "category": "INGREDIENT",
    "purchaseQuantity": 50,
    "purchaseUnit": "g",
    "purchaseCost": 25,
    "unitCost": 0.5,
    "updatedAt": "2026-09-22T17:12:44.979Z",
    "createdAt": "2026-09-22T17:12:44.979Z"
  },
  {
    "id": "cmucxmsho000212p8ev0jvra9",
    "name": "Granulated Sugar (Migros 1kg)",
    "category": "INGREDIENT",
    "purchaseQuantity": 1000,
    "purchaseUnit": "g",
    "purchaseCost": 53,
    "unitCost": 0.053,
    "updatedAt": "2026-09-22T17:12:44.989Z",
    "createdAt": "2026-09-22T17:12:44.989Z"
  },
  {
    "id": "cmucxmshy000312p8u2holr9s",
    "name": "Vegetable Oil (Migros 1kg)",
    "category": "INGREDIENT",
    "purchaseQuantity": 1000,
    "purchaseUnit": "g",
    "purchaseCost": 126,
    "unitCost": 0.126,
    "updatedAt": "2026-09-22T17:12:44.998Z",
    "createdAt": "2026-09-22T17:12:44.998Z"
  },
  {
    "id": "cmucxmsi6000412p8o551pd5e",
    "name": "Yogurt (Migros 1.5kg)",
    "category": "INGREDIENT",
    "purchaseQuantity": 1500,
    "purchaseUnit": "g",
    "purchaseCost": 103,
    "unitCost": 0.06866666666666667,
    "updatedAt": "2026-09-22T17:12:45.007Z",
    "createdAt": "2026-09-22T17:12:45.007Z"
  },
  {
    "id": "cmucxmsie000512p8swomcawl",
    "name": "Flour (Migros 2kg)",
    "category": "INGREDIENT",
    "purchaseQuantity": 2000,
    "purchaseUnit": "g",
    "purchaseCost": 61,
    "unitCost": 0.0305,
    "updatedAt": "2026-09-22T17:12:45.014Z",
    "createdAt": "2026-09-22T17:12:45.014Z"
  },
  {
    "id": "cmucxmsil000612p8lms9r8bi",
    "name": "Baking Powder (Dr. Oetker 100g)",
    "category": "INGREDIENT",
    "purchaseQuantity": 100,
    "purchaseUnit": "g",
    "purchaseCost": 34,
    "unitCost": 0.34,
    "updatedAt": "2026-09-22T17:12:45.021Z",
    "createdAt": "2026-09-22T17:12:45.021Z"
  },
  {
    "id": "cmucxmsit000712p8srxjlod4",
    "name": "Labneh (İçim 400g)",
    "category": "INGREDIENT",
    "purchaseQuantity": 400,
    "purchaseUnit": "g",
    "purchaseCost": 166,
    "unitCost": 0.415,
    "updatedAt": "2026-09-22T17:12:45.030Z",
    "createdAt": "2026-09-22T17:12:45.030Z"
  },
  {
    "id": "cmucxmsj4000812p8h6ovu9t9",
    "name": "Zaatar (Bludan Market Jordan 250g)",
    "category": "INGREDIENT",
    "purchaseQuantity": 250,
    "purchaseUnit": "g",
    "purchaseCost": 100,
    "unitCost": 0.4,
    "updatedAt": "2026-09-22T17:12:45.040Z",
    "createdAt": "2026-09-22T17:12:45.040Z"
  },
  {
    "id": "cmucxmsje000912p8o0zkbc48",
    "name": "Cupcake Box (AVM 20 Pcs)",
    "category": "PACKAGING",
    "purchaseQuantity": 20,
    "purchaseUnit": "pcs",
    "purchaseCost": 200,
    "unitCost": 10,
    "updatedAt": "2026-09-22T17:12:45.050Z",
    "createdAt": "2026-09-22T17:12:45.050Z"
  },
  {
    "id": "cmucxmsjo000a12p8y18n96v8",
    "name": "Branding & Allergen Stickers (Kırtasiye 20 Pcs)",
    "category": "PACKAGING",
    "purchaseQuantity": 20,
    "purchaseUnit": "pcs",
    "purchaseCost": 20,
    "unitCost": 1,
    "updatedAt": "2026-09-22T17:12:45.060Z",
    "createdAt": "2026-09-22T17:12:45.060Z"
  },
  {
    "id": "cmucxmsjx000b12p8euyi5uu1",
    "name": "Transport Bag (AVM 1 Pc)",
    "category": "PACKAGING",
    "purchaseQuantity": 1,
    "purchaseUnit": "pcs",
    "purchaseCost": 10,
    "unitCost": 10,
    "updatedAt": "2026-09-22T17:12:45.070Z",
    "createdAt": "2026-09-22T17:12:45.070Z"
  },
  {
    "id": "cmucxmsk7000c12p8nfrgf2wv",
    "name": "Electricity / Water Utility (Gov)",
    "category": "OVERHEAD",
    "purchaseQuantity": 1,
    "purchaseUnit": "pcs",
    "purchaseCost": 7,
    "unitCost": 7,
    "updatedAt": "2026-09-22T17:12:45.079Z",
    "createdAt": "2026-09-22T17:12:45.079Z"
  },
  {
    "id": "cmuek6lxe0000ukhol3s2uqzh",
    "name": "Brown Sugar (Takita 500g)",
    "category": "INGREDIENT",
    "purchaseQuantity": 500,
    "purchaseUnit": "g",
    "purchaseCost": 140,
    "unitCost": 0.28,
    "updatedAt": "2026-09-23T20:31:47.329Z",
    "createdAt": "2026-09-23T20:31:47.329Z"
  },
  {
    "id": "cmuek6lye0001ukhokaojdnh3",
    "name": "Granulated Sugar (Makbul 1kg)",
    "category": "INGREDIENT",
    "purchaseQuantity": 1000,
    "purchaseUnit": "g",
    "purchaseCost": 43,
    "unitCost": 0.043,
    "updatedAt": "2026-09-23T20:31:47.367Z",
    "createdAt": "2026-09-23T20:31:47.367Z"
  },
  {
    "id": "cmuek6lyo0002ukhooaf8tktr",
    "name": "Butter (Migros 250g)",
    "category": "INGREDIENT",
    "purchaseQuantity": 250,
    "purchaseUnit": "g",
    "purchaseCost": 156,
    "unitCost": 0.624,
    "updatedAt": "2026-09-23T20:31:47.377Z",
    "createdAt": "2026-09-23T20:31:47.377Z"
  },
  {
    "id": "cmuek6lyx0003ukhonsxbk56v",
    "name": "Baking Soda (Bağdat 150g)",
    "category": "INGREDIENT",
    "purchaseQuantity": 150,
    "purchaseUnit": "g",
    "purchaseCost": 43,
    "unitCost": 0.2866666666666667,
    "updatedAt": "2026-09-23T20:31:47.386Z",
    "createdAt": "2026-09-23T20:31:47.386Z"
  },
  {
    "id": "cmuek6lz60004ukhoa7hhul01",
    "name": "Walnuts (Makbul 1kg)",
    "category": "INGREDIENT",
    "purchaseQuantity": 1000,
    "purchaseUnit": "g",
    "purchaseCost": 549,
    "unitCost": 0.549,
    "updatedAt": "2026-09-23T20:31:47.394Z",
    "createdAt": "2026-09-23T20:31:47.394Z"
  },
  {
    "id": "cmuek6lzf0005ukho5t7qua7w",
    "name": "Fresh Carrots (Migros 1kg)",
    "category": "INGREDIENT",
    "purchaseQuantity": 1000,
    "purchaseUnit": "g",
    "purchaseCost": 40,
    "unitCost": 0.04,
    "updatedAt": "2026-09-23T20:31:47.403Z",
    "createdAt": "2026-09-23T20:31:47.403Z"
  },
  {
    "id": "cmuek6lzq0006ukhob2sb9r8a",
    "name": "Cinnamon & Spices (Makbul 1kg)",
    "category": "INGREDIENT",
    "purchaseQuantity": 1000,
    "purchaseUnit": "g",
    "purchaseCost": 250,
    "unitCost": 0.25,
    "updatedAt": "2026-09-23T20:31:47.414Z",
    "createdAt": "2026-09-23T20:31:47.414Z"
  },
  {
    "id": "cmuek6m000007ukhoij6a3v9x",
    "name": "Whole Milk (Migros 1L)",
    "category": "INGREDIENT",
    "purchaseQuantity": 1000,
    "purchaseUnit": "g",
    "purchaseCost": 44,
    "unitCost": 0.044,
    "updatedAt": "2026-09-23T20:31:47.424Z",
    "createdAt": "2026-09-23T20:31:47.424Z"
  },
  {
    "id": "cmuek6m0a0008ukhofg594ui7",
    "name": "Labneh Cream Cheese (Migros 200g)",
    "category": "INGREDIENT",
    "purchaseQuantity": 200,
    "purchaseUnit": "g",
    "purchaseCost": 57,
    "unitCost": 0.285,
    "updatedAt": "2026-09-23T20:31:47.434Z",
    "createdAt": "2026-09-23T20:31:47.434Z"
  },
  {
    "id": "cmuek6m0i0009ukhoi73lcyal",
    "name": "Powdered Sugar (Makbul 1kg)",
    "category": "INGREDIENT",
    "purchaseQuantity": 1000,
    "purchaseUnit": "g",
    "purchaseCost": 80,
    "unitCost": 0.08,
    "updatedAt": "2026-09-23T20:31:47.442Z",
    "createdAt": "2026-09-23T20:31:47.442Z"
  },
  {
    "id": "cmuek6m0s000aukho9iyczobs",
    "name": "Food Coloring (Market 15g)",
    "category": "PACKAGING",
    "purchaseQuantity": 15,
    "purchaseUnit": "g",
    "purchaseCost": 25,
    "unitCost": 1.666666666666667,
    "updatedAt": "2026-09-23T20:31:47.452Z",
    "createdAt": "2026-09-23T20:31:47.452Z"
  },
  {
    "id": "cmuek6m12000bukhormw0c17k",
    "name": "Cupcake Paper Liners (AVM 100 Pcs)",
    "category": "PACKAGING",
    "purchaseQuantity": 100,
    "purchaseUnit": "pcs",
    "purchaseCost": 95,
    "unitCost": 0.95,
    "updatedAt": "2026-09-23T20:31:47.462Z",
    "createdAt": "2026-09-23T20:31:47.462Z"
  },
  {
    "id": "cmufwmifu0000in2fbpx121sm",
    "name": "Cacao Powder (Migros 50g)",
    "category": "INGREDIENT",
    "purchaseQuantity": 50,
    "purchaseUnit": "g",
    "purchaseCost": 29,
    "unitCost": 0.58,
    "updatedAt": "2026-09-24T19:07:50.874Z",
    "createdAt": "2026-09-24T19:07:50.874Z"
  },
  {
    "id": "cmufwmig40001in2fx4yy7x7m",
    "name": "Plastic Bag (AVM 100 Pcs)",
    "category": "PACKAGING",
    "purchaseQuantity": 100,
    "purchaseUnit": "pcs",
    "purchaseCost": 250,
    "unitCost": 2.5,
    "updatedAt": "2026-09-24T19:07:50.884Z",
    "createdAt": "2026-09-24T19:07:50.884Z"
  }
];
  for (const m of materialsData) {
    await prisma.rawMaterial.create({
      data: {
        id: m.id,
        name: m.name,
        category: m.category,
        purchaseQuantity: m.purchaseQuantity,
        purchaseUnit: m.purchaseUnit,
        purchaseCost: m.purchaseCost,
        unitCost: m.unitCost,
      },
    });
  }

  console.log('Seeding authentic recipes...');
  const recipesData = [
  {
    "id": "cmucxmskh000d12p829ubfweo",
    "name": "Zaatar & Labneh Savory Cupcakes",
    "skuPrefix": "ZLC",
    "description": "Handcrafted savory zaatar cupcakes with creamy İçim labneh, individually portioned in custom cupcake boxes and transport bags with branding stickers",
    "yieldSlices": 18,
    "ovenMinutes": 25,
    "shelfLifeDays": 4,
    "overheadPercent": 0,
    "outerBoxCost": 0,
    "wrapCostPerSlice": 20,
    "labelCostPerSlice": 2,
    "createdAt": "2026-09-22T17:12:45.089Z",
    "updatedAt": "2026-09-23T20:48:45.578Z",
    "ingredients": [
      {
        "id": "cmucxmskk000f12p8kuxgfeq7",
        "recipeId": "cmucxmskh000d12p829ubfweo",
        "rawMaterialId": "cmucxmsh3000012p8shqoo0nq",
        "quantityUsed": 3
      },
      {
        "id": "cmucxmskk000g12p8ifmy2lql",
        "recipeId": "cmucxmskh000d12p829ubfweo",
        "rawMaterialId": "cmucxmshf000112p8lmi7ccgy",
        "quantityUsed": 3
      },
      {
        "id": "cmucxmskk000h12p82gt5u7gr",
        "recipeId": "cmucxmskh000d12p829ubfweo",
        "rawMaterialId": "cmucxmsho000212p8ev0jvra9",
        "quantityUsed": 115
      },
      {
        "id": "cmucxmskk000i12p8ny4xt8sr",
        "recipeId": "cmucxmskh000d12p829ubfweo",
        "rawMaterialId": "cmucxmshy000312p8u2holr9s",
        "quantityUsed": 95
      },
      {
        "id": "cmucxmskk000j12p86quuyuti",
        "recipeId": "cmucxmskh000d12p829ubfweo",
        "rawMaterialId": "cmucxmsi6000412p8o551pd5e",
        "quantityUsed": 170
      },
      {
        "id": "cmucxmskk000k12p8goyranmx",
        "recipeId": "cmucxmskh000d12p829ubfweo",
        "rawMaterialId": "cmucxmsie000512p8swomcawl",
        "quantityUsed": 195
      },
      {
        "id": "cmucxmskk000l12p874hirove",
        "recipeId": "cmucxmskh000d12p829ubfweo",
        "rawMaterialId": "cmucxmsil000612p8lms9r8bi",
        "quantityUsed": 10
      },
      {
        "id": "cmucxmskk000m12p8s8r305ym",
        "recipeId": "cmucxmskh000d12p829ubfweo",
        "rawMaterialId": "cmucxmsit000712p8srxjlod4",
        "quantityUsed": 800
      },
      {
        "id": "cmucxmskk000n12p8byxnzxa6",
        "recipeId": "cmucxmskh000d12p829ubfweo",
        "rawMaterialId": "cmucxmsj4000812p8h6ovu9t9",
        "quantityUsed": 40
      },
      {
        "id": "cmuekoum50001g85hpi9iufko",
        "recipeId": "cmucxmskh000d12p829ubfweo",
        "rawMaterialId": "cmucxmsk7000c12p8nfrgf2wv",
        "quantityUsed": 18
      }
    ]
  },
  {
    "id": "cmuek6m1f000cukho7fka4y80",
    "name": "Carrot Walnut Cupcake with Cream Cheese Frosting",
    "skuPrefix": "CWC",
    "description": "Moist spiced carrot walnut cupcakes with cinnamon topped with velvety labneh cream cheese frosting, presented in individual cupcake liners and display boxes",
    "yieldSlices": 15,
    "ovenMinutes": 25,
    "shelfLifeDays": 4,
    "overheadPercent": 0,
    "outerBoxCost": 0,
    "wrapCostPerSlice": 10.95,
    "labelCostPerSlice": 0.33333,
    "createdAt": "2026-09-23T20:31:47.475Z",
    "updatedAt": "2026-09-23T20:48:45.591Z",
    "ingredients": [
      {
        "id": "cmuek6m1i000eukhoz8ux2v9m",
        "recipeId": "cmuek6m1f000cukho7fka4y80",
        "rawMaterialId": "cmucxmsh3000012p8shqoo0nq",
        "quantityUsed": 3
      },
      {
        "id": "cmuek6m1i000fukhowre2tyzr",
        "recipeId": "cmuek6m1f000cukho7fka4y80",
        "rawMaterialId": "cmuek6lxe0000ukhol3s2uqzh",
        "quantityUsed": 107
      },
      {
        "id": "cmuek6m1i000gukhoozkcp5rl",
        "recipeId": "cmuek6m1f000cukho7fka4y80",
        "rawMaterialId": "cmuek6lye0001ukhokaojdnh3",
        "quantityUsed": 100
      },
      {
        "id": "cmuek6m1i000hukhobazoahxf",
        "recipeId": "cmuek6m1f000cukho7fka4y80",
        "rawMaterialId": "cmucxmshy000312p8u2holr9s",
        "quantityUsed": 50
      },
      {
        "id": "cmuek6m1i000iukho294bbtsh",
        "recipeId": "cmuek6m1f000cukho7fka4y80",
        "rawMaterialId": "cmuek6lyo0002ukhooaf8tktr",
        "quantityUsed": 132
      },
      {
        "id": "cmuek6m1i000jukhohneib4dl",
        "recipeId": "cmuek6m1f000cukho7fka4y80",
        "rawMaterialId": "cmucxmsie000512p8swomcawl",
        "quantityUsed": 150
      },
      {
        "id": "cmuek6m1i000kukhoccpgkpm5",
        "recipeId": "cmuek6m1f000cukho7fka4y80",
        "rawMaterialId": "cmuek6lyx0003ukhonsxbk56v",
        "quantityUsed": 6
      },
      {
        "id": "cmuek6m1i000lukhonpe0r8ju",
        "recipeId": "cmuek6m1f000cukho7fka4y80",
        "rawMaterialId": "cmuek6lz60004ukhoa7hhul01",
        "quantityUsed": 100
      },
      {
        "id": "cmuek6m1i000mukhovzncvtvb",
        "recipeId": "cmuek6m1f000cukho7fka4y80",
        "rawMaterialId": "cmuek6lzf0005ukho5t7qua7w",
        "quantityUsed": 125
      },
      {
        "id": "cmuek6m1i000nukho8bk2fdsd",
        "recipeId": "cmuek6m1f000cukho7fka4y80",
        "rawMaterialId": "cmuek6lzq0006ukhob2sb9r8a",
        "quantityUsed": 12
      },
      {
        "id": "cmuek6m1i000oukhobpcwom81",
        "recipeId": "cmuek6m1f000cukho7fka4y80",
        "rawMaterialId": "cmuek6m000007ukhoij6a3v9x",
        "quantityUsed": 82
      },
      {
        "id": "cmuek6m1i000pukholabdcfbo",
        "recipeId": "cmuek6m1f000cukho7fka4y80",
        "rawMaterialId": "cmuek6m0a0008ukhofg594ui7",
        "quantityUsed": 150
      },
      {
        "id": "cmuek6m1i000qukhoxknxyasr",
        "recipeId": "cmuek6m1f000cukho7fka4y80",
        "rawMaterialId": "cmuek6m0i0009ukhoi73lcyal",
        "quantityUsed": 156
      },
      {
        "id": "cmuek6m1i000rukhoqqjrf257",
        "recipeId": "cmuek6m1f000cukho7fka4y80",
        "rawMaterialId": "cmucxmshf000112p8lmi7ccgy",
        "quantityUsed": 5
      },
      {
        "id": "cmuekoumz0003g85hwfxpkeim",
        "recipeId": "cmuek6m1f000cukho7fka4y80",
        "rawMaterialId": "cmucxmsk7000c12p8nfrgf2wv",
        "quantityUsed": 15
      }
    ]
  },
  {
    "id": "cmufwmige0002in2fv0vo14jp",
    "name": "Marble Cake",
    "skuPrefix": "MBC",
    "description": "Classic rich marble cake baked with premium Migros cacao swirl and golden butter crumb, packaged in individual hygienic plastic bags",
    "yieldSlices": 8,
    "ovenMinutes": 30,
    "shelfLifeDays": 5,
    "overheadPercent": 0,
    "outerBoxCost": 0,
    "wrapCostPerSlice": 2.5,
    "labelCostPerSlice": 0,
    "createdAt": "2026-09-24T19:07:50.894Z",
    "updatedAt": "2026-09-24T19:07:50.894Z",
    "ingredients": [
      {
        "id": "cmufwmige0004in2f8xdh4icx",
        "recipeId": "cmufwmige0002in2fv0vo14jp",
        "rawMaterialId": "cmucxmsh3000012p8shqoo0nq",
        "quantityUsed": 3
      },
      {
        "id": "cmufwmige0005in2fee9f6w3z",
        "recipeId": "cmufwmige0002in2fv0vo14jp",
        "rawMaterialId": "cmuek6lye0001ukhokaojdnh3",
        "quantityUsed": 180
      },
      {
        "id": "cmufwmige0006in2fn6fudhip",
        "recipeId": "cmufwmige0002in2fv0vo14jp",
        "rawMaterialId": "cmucxmshy000312p8u2holr9s",
        "quantityUsed": 55
      },
      {
        "id": "cmufwmige0007in2ff5dmzeso",
        "recipeId": "cmufwmige0002in2fv0vo14jp",
        "rawMaterialId": "cmuek6lyo0002ukhooaf8tktr",
        "quantityUsed": 55
      },
      {
        "id": "cmufwmige0008in2fn59uwjxs",
        "recipeId": "cmufwmige0002in2fv0vo14jp",
        "rawMaterialId": "cmucxmsie000512p8swomcawl",
        "quantityUsed": 200
      },
      {
        "id": "cmufwmige0009in2fral4naq7",
        "recipeId": "cmufwmige0002in2fv0vo14jp",
        "rawMaterialId": "cmuek6m000007ukhoij6a3v9x",
        "quantityUsed": 60
      },
      {
        "id": "cmufwmige000ain2f1jf22qva",
        "recipeId": "cmufwmige0002in2fv0vo14jp",
        "rawMaterialId": "cmucxmsil000612p8lms9r8bi",
        "quantityUsed": 10
      },
      {
        "id": "cmufwmige000bin2fmvdud9vz",
        "recipeId": "cmufwmige0002in2fv0vo14jp",
        "rawMaterialId": "cmufwmifu0000in2fbpx121sm",
        "quantityUsed": 14
      },
      {
        "id": "cmufwmige000cin2flud2e27z",
        "recipeId": "cmufwmige0002in2fv0vo14jp",
        "rawMaterialId": "cmucxmshf000112p8lmi7ccgy",
        "quantityUsed": 5
      },
      {
        "id": "cmufwmige000din2fj7fog90p",
        "recipeId": "cmufwmige0002in2fv0vo14jp",
        "rawMaterialId": "cmucxmsk7000c12p8nfrgf2wv",
        "quantityUsed": 8
      }
    ]
  }
];
  for (const r of recipesData) {
    await prisma.recipe.create({
      data: {
        id: r.id,
        name: r.name,
        skuPrefix: r.skuPrefix,
        description: r.description,
        yieldSlices: r.yieldSlices,
        ovenMinutes: r.ovenMinutes,
        shelfLifeDays: r.shelfLifeDays,
        overheadPercent: r.overheadPercent,
        outerBoxCost: r.outerBoxCost,
        wrapCostPerSlice: r.wrapCostPerSlice,
        labelCostPerSlice: r.labelCostPerSlice,
        ingredients: {
          create: r.ingredients.map((ing) => ({
            id: ing.id,
            rawMaterialId: ing.rawMaterialId,
            quantityUsed: ing.quantityUsed,
          })),
        },
      },
    });
  }

  console.log('Seeding customer cafes...');
  const cafesData = [
  {
    "id": "cmucxj0i6000022tlr1b7o1rs",
    "name": "Momoe Cafe",
    "branch": "Ortabayır, Çeşmebaşi Sk 55a, Kağıthane/İstanbul",
    "contactPerson": "Store Manager / Barista",
    "phone": "+905015595099",
    "clientCode": "MC-001",
    "defaultPaymentMethod": "COD",
    "defaultPricePerSlice": 80,
    "createdAt": "2026-09-22T17:09:48.748Z",
    "updatedAt": "2026-09-22T17:12:45.116Z"
  }
];
  for (const c of cafesData) {
    await prisma.cafe.create({
      data: {
        id: c.id,
        name: c.name,
        branch: c.branch,
        contactPerson: c.contactPerson,
        phone: c.phone,
        clientCode: c.clientCode,
        defaultPaymentMethod: c.defaultPaymentMethod,
        defaultPricePerSlice: c.defaultPricePerSlice,
      },
    });
  }

  console.log('Seeding initial order...');
  const ordersData = [
  {
    "id": "cmuel0e430001zhhno8ygclav",
    "invoiceRef": "JB-2026-0001",
    "cafeId": "cmucxj0i6000022tlr1b7o1rs",
    "status": "PAID",
    "paymentMethod": "COD",
    "paymentTerms": "COD / 3 Days Net",
    "orderDate": "2026-09-23T20:54:56.873Z",
    "deliveryDate": "2026-09-23T00:00:00.000Z",
    "dispatchTime": "04:00 PM ",
    "totalLoaves": 1,
    "totalSlices": 15,
    "totalCost": 544.71,
    "totalRevenue": 900,
    "netProfit": 355.29,
    "profitMargin": 39.48,
    "notes": null,
    "createdAt": "2026-09-23T20:54:56.883Z",
    "updatedAt": "2026-09-23T20:55:10.914Z",
    "items": [
      {
        "id": "cmuel0e430003zhhnyugymz7b",
        "orderId": "cmuel0e430001zhhno8ygclav",
        "recipeId": "cmuek6m1f000cukho7fka4y80",
        "loavesOrdered": 1,
        "yieldPerLoaf": 15,
        "totalSlices": 15,
        "unitCostPerSlice": 36.314,
        "pricePerSlice": 60,
        "lineCost": 544.71,
        "lineRevenue": 900,
        "lineProfit": 355.29,
        "batchCode": "CWC-260923",
        "productionDate": "2026-09-23T20:54:56.873Z",
        "bestBeforeDate": "2026-09-27T00:00:00.000Z"
      }
    ]
  }
];
  for (const o of ordersData) {
    await prisma.order.create({
      data: {
        id: o.id,
        invoiceRef: o.invoiceRef,
        cafeId: o.cafeId,
        status: o.status,
        paymentMethod: o.paymentMethod,
        paymentTerms: o.paymentTerms,
        orderDate: new Date(o.orderDate),
        deliveryDate: new Date(o.deliveryDate),
        dispatchTime: o.dispatchTime,
        totalLoaves: o.totalLoaves,
        totalSlices: o.totalSlices,
        totalCost: o.totalCost,
        totalRevenue: o.totalRevenue,
        netProfit: o.netProfit,
        profitMargin: o.profitMargin,
        notes: o.notes,
        items: {
          create: o.items.map((it) => ({
            id: it.id,
            recipeId: it.recipeId,
            loavesOrdered: it.loavesOrdered,
            yieldPerLoaf: it.yieldPerLoaf,
            totalSlices: it.totalSlices,
            unitCostPerSlice: it.unitCostPerSlice,
            pricePerSlice: it.pricePerSlice,
            lineCost: it.lineCost,
            lineRevenue: it.lineRevenue,
            lineProfit: it.lineProfit,
            batchCode: it.batchCode,
            productionDate: new Date(it.productionDate),
            bestBeforeDate: new Date(it.bestBeforeDate),
          })),
        },
      },
    });
  }

  console.log('Database successfully seeded with authentic bakery data!');
}

seedDatabase()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
