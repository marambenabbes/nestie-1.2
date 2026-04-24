"""Nutrition AI router — personalized meal suggestions."""

import os
import random
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

# Nutrient targets by trimester (daily)
NUTRIENT_TARGETS = {
    1: {"calories": 1800, "protein_g": 71, "iron_mg": 27, "calcium_mg": 1000, "folic_acid_mcg": 600, "dha_mg": 200},
    2: {"calories": 2200, "protein_g": 71, "iron_mg": 27, "calcium_mg": 1000, "folic_acid_mcg": 600, "dha_mg": 200},
    3: {"calories": 2400, "protein_g": 71, "iron_mg": 27, "calcium_mg": 1000, "folic_acid_mcg": 600, "dha_mg": 200},
}

# Default / international meals
MEAL_SUGGESTIONS = {
    "BREAKFAST": [
        {"name": "Spinach & Feta Omelette", "calories": 350, "protein_g": 24, "iron_mg": 4.5, "ingredients": "Eggs, spinach, feta, whole wheat toast"},
        {"name": "Berry Overnight Oats", "calories": 320, "protein_g": 12, "iron_mg": 3.2, "ingredients": "Oats, Greek yogurt, mixed berries, chia seeds, honey"},
        {"name": "Avocado Toast with Egg", "calories": 380, "protein_g": 18, "iron_mg": 2.8, "ingredients": "Whole grain bread, avocado, poached egg, tomato"},
    ],
    "LUNCH": [
        {"name": "Salmon & Quinoa Bowl", "calories": 520, "protein_g": 35, "iron_mg": 4.0, "ingredients": "Grilled salmon, quinoa, roasted vegetables, lemon dressing"},
        {"name": "Lentil & Vegetable Soup", "calories": 380, "protein_g": 18, "iron_mg": 6.5, "ingredients": "Red lentils, carrots, tomatoes, spinach, cumin"},
        {"name": "Chicken Caesar Wrap", "calories": 450, "protein_g": 30, "iron_mg": 2.5, "ingredients": "Grilled chicken, romaine, parmesan, whole wheat tortilla"},
    ],
    "DINNER": [
        {"name": "Lean Beef Stir-fry", "calories": 480, "protein_g": 32, "iron_mg": 5.8, "ingredients": "Lean beef, broccoli, bell peppers, brown rice, ginger"},
        {"name": "Baked Cod with Sweet Potato", "calories": 420, "protein_g": 28, "iron_mg": 2.0, "ingredients": "Cod fillet, sweet potato, green beans, lemon herb sauce"},
        {"name": "Chickpea & Vegetable Curry", "calories": 400, "protein_g": 16, "iron_mg": 4.5, "ingredients": "Chickpeas, coconut milk, spinach, tomatoes, turmeric, rice"},
    ],
    "SNACK": [
        {"name": "Greek Yogurt Parfait", "calories": 200, "protein_g": 15, "iron_mg": 0.5, "ingredients": "Greek yogurt, granola, fresh fruits, honey"},
        {"name": "Trail Mix", "calories": 180, "protein_g": 6, "iron_mg": 1.8, "ingredients": "Almonds, walnuts, dried apricots, dark chocolate chips"},
        {"name": "Apple & Peanut Butter", "calories": 220, "protein_g": 7, "iron_mg": 0.6, "ingredients": "Apple slices, natural peanut butter"},
    ],
}

# Country-specific pregnancy-safe meal databases
COUNTRY_MEALS = {
    "Italy": {
        "BREAKFAST": [
            {"name": "Frittata di Spinaci", "calories": 340, "protein_g": 22, "iron_mg": 5.0, "ingredients": "Eggs, spinach, Parmigiano-Reggiano, olive oil, whole grain bread"},
            {"name": "Yogurt con Frutta e Miele", "calories": 280, "protein_g": 14, "iron_mg": 1.5, "ingredients": "Greek yogurt, figs, walnuts, chestnut honey, oats"},
            {"name": "Pane Integrale con Ricotta", "calories": 310, "protein_g": 16, "iron_mg": 2.0, "ingredients": "Whole wheat bread, fresh ricotta, tomatoes, basil, olive oil"},
        ],
        "LUNCH": [
            {"name": "Pasta e Lenticchie", "calories": 480, "protein_g": 22, "iron_mg": 7.0, "ingredients": "Whole wheat pasta, lentils, carrots, celery, tomato, rosemary"},
            {"name": "Risotto agli Spinaci", "calories": 450, "protein_g": 16, "iron_mg": 5.5, "ingredients": "Arborio rice, fresh spinach, Parmigiano, vegetable broth, onion"},
            {"name": "Insalata di Farro", "calories": 420, "protein_g": 18, "iron_mg": 4.0, "ingredients": "Farro, cherry tomatoes, mozzarella, arugula, olive oil, basil"},
        ],
        "DINNER": [
            {"name": "Branzino al Forno", "calories": 380, "protein_g": 34, "iron_mg": 2.5, "ingredients": "Sea bass, cherry tomatoes, olives, capers, potatoes, lemon"},
            {"name": "Pollo alla Cacciatora", "calories": 450, "protein_g": 36, "iron_mg": 3.0, "ingredients": "Chicken thighs, tomatoes, bell peppers, onions, herbs, polenta"},
            {"name": "Minestrone alla Genovese", "calories": 350, "protein_g": 14, "iron_mg": 4.5, "ingredients": "Cannellini beans, zucchini, potatoes, carrots, pesto, pasta"},
        ],
        "SNACK": [
            {"name": "Bruschetta Pomodoro", "calories": 180, "protein_g": 5, "iron_mg": 1.5, "ingredients": "Toasted ciabatta, fresh tomatoes, basil, garlic, extra virgin olive oil"},
            {"name": "Panna Cotta allo Yogurt", "calories": 200, "protein_g": 8, "iron_mg": 0.5, "ingredients": "Greek yogurt, honey, vanilla, fresh berries"},
            {"name": "Mandorle e Frutta Secca", "calories": 190, "protein_g": 7, "iron_mg": 1.8, "ingredients": "Almonds, dried figs, dried apricots, dark chocolate"},
        ],
    },
    "Japan": {
        "BREAKFAST": [
            {"name": "Tamago Gohan", "calories": 350, "protein_g": 18, "iron_mg": 3.0, "ingredients": "Steamed rice, raw egg, soy sauce, nori, miso soup"},
            {"name": "Salmon Onigiri Set", "calories": 380, "protein_g": 22, "iron_mg": 2.5, "ingredients": "Rice, grilled salmon, nori, pickled vegetables, green tea"},
            {"name": "Tofu & Vegetable Miso", "calories": 300, "protein_g": 16, "iron_mg": 4.0, "ingredients": "Silken tofu, miso paste, wakame, green onion, rice"},
        ],
        "LUNCH": [
            {"name": "Salmon Teriyaki Bento", "calories": 520, "protein_g": 32, "iron_mg": 3.5, "ingredients": "Grilled salmon, teriyaki sauce, rice, edamame, pickled daikon"},
            {"name": "Soba Noodle Bowl", "calories": 420, "protein_g": 18, "iron_mg": 4.0, "ingredients": "Buckwheat noodles, tempura vegetables, dashi broth, green onion"},
            {"name": "Oyakodon", "calories": 480, "protein_g": 28, "iron_mg": 3.0, "ingredients": "Chicken, egg, onion, dashi, mirin, rice, mitsuba"},
        ],
        "DINNER": [
            {"name": "Grilled Mackerel Set", "calories": 450, "protein_g": 30, "iron_mg": 3.5, "ingredients": "Grilled mackerel, rice, miso soup, pickles, grated daikon"},
            {"name": "Nikujaga", "calories": 400, "protein_g": 22, "iron_mg": 4.5, "ingredients": "Beef, potatoes, carrots, onion, shirataki noodles, soy sauce, mirin"},
            {"name": "Tofu Nabe Hot Pot", "calories": 380, "protein_g": 24, "iron_mg": 5.0, "ingredients": "Tofu, Chinese cabbage, mushrooms, udon, kombu dashi"},
        ],
        "SNACK": [
            {"name": "Edamame", "calories": 180, "protein_g": 16, "iron_mg": 3.5, "ingredients": "Steamed edamame, sea salt"},
            {"name": "Matcha Yogurt", "calories": 170, "protein_g": 10, "iron_mg": 1.0, "ingredients": "Greek yogurt, matcha powder, honey, kinako"},
            {"name": "Onigiri", "calories": 200, "protein_g": 6, "iron_mg": 1.0, "ingredients": "Rice, umeboshi plum, nori, sesame seeds"},
        ],
    },
    "Mexico": {
        "BREAKFAST": [
            {"name": "Huevos Rancheros", "calories": 400, "protein_g": 22, "iron_mg": 4.5, "ingredients": "Eggs, black beans, corn tortillas, salsa roja, avocado, queso fresco"},
            {"name": "Chilaquiles Verdes", "calories": 380, "protein_g": 20, "iron_mg": 3.5, "ingredients": "Tortilla chips, green tomatillo salsa, eggs, cream, cheese, cilantro"},
            {"name": "Avena con Frutas", "calories": 320, "protein_g": 12, "iron_mg": 3.0, "ingredients": "Oats, cinnamon, piloncillo, banana, strawberries, pecans"},
        ],
        "LUNCH": [
            {"name": "Pozole Verde de Pollo", "calories": 450, "protein_g": 30, "iron_mg": 4.0, "ingredients": "Chicken, hominy, tomatillos, pepitas, radish, oregano, lime"},
            {"name": "Ensalada de Nopales", "calories": 380, "protein_g": 16, "iron_mg": 5.5, "ingredients": "Nopales, black beans, tomato, avocado, queso panela, lime"},
            {"name": "Tacos de Pescado", "calories": 420, "protein_g": 26, "iron_mg": 2.5, "ingredients": "Grilled white fish, cabbage slaw, corn tortillas, lime crema, cilantro"},
        ],
        "DINNER": [
            {"name": "Pollo en Mole Poblano", "calories": 480, "protein_g": 34, "iron_mg": 5.0, "ingredients": "Chicken breast, mole sauce, sesame seeds, rice, warm tortillas"},
            {"name": "Sopa de Frijol Negro", "calories": 380, "protein_g": 20, "iron_mg": 6.5, "ingredients": "Black beans, tomatoes, onion, epazote, chipotle, avocado, lime"},
            {"name": "Enchiladas Suizas", "calories": 440, "protein_g": 28, "iron_mg": 3.5, "ingredients": "Chicken, corn tortillas, green tomatillo cream sauce, cheese, cream"},
        ],
        "SNACK": [
            {"name": "Fruta con Chile y Limón", "calories": 150, "protein_g": 2, "iron_mg": 0.8, "ingredients": "Mango, jicama, cucumber, lime juice, tajín"},
            {"name": "Elote en Vaso", "calories": 220, "protein_g": 6, "iron_mg": 1.0, "ingredients": "Corn kernels, mayonnaise, lime, chili powder, cotija cheese"},
            {"name": "Guacamole con Totopos", "calories": 250, "protein_g": 4, "iron_mg": 1.2, "ingredients": "Avocado, tomato, onion, lime, cilantro, baked tortilla chips"},
        ],
    },
    "India": {
        "BREAKFAST": [
            {"name": "Moong Dal Chilla", "calories": 320, "protein_g": 18, "iron_mg": 5.0, "ingredients": "Moong dal batter, spinach, onion, green chili, coriander, mint chutney"},
            {"name": "Poha with Vegetables", "calories": 300, "protein_g": 8, "iron_mg": 14.0, "ingredients": "Flattened rice, peanuts, turmeric, curry leaves, lemon, peas"},
            {"name": "Idli Sambar", "calories": 280, "protein_g": 10, "iron_mg": 3.5, "ingredients": "Steamed rice-lentil cakes, sambar with vegetables, coconut chutney"},
        ],
        "LUNCH": [
            {"name": "Palak Paneer Thali", "calories": 520, "protein_g": 24, "iron_mg": 8.0, "ingredients": "Spinach, paneer, whole wheat roti, dal, rice, raita, pickle"},
            {"name": "Rajma Chawal", "calories": 480, "protein_g": 20, "iron_mg": 6.5, "ingredients": "Kidney beans, basmati rice, tomato gravy, onion, cumin, coriander"},
            {"name": "Fish Curry with Rice", "calories": 450, "protein_g": 30, "iron_mg": 3.0, "ingredients": "White fish, coconut curry, mustard seeds, curry leaves, rice"},
        ],
        "DINNER": [
            {"name": "Dal Tadka with Roti", "calories": 400, "protein_g": 18, "iron_mg": 5.5, "ingredients": "Yellow lentils, ghee tadka, cumin, garlic, tomato, whole wheat roti"},
            {"name": "Chicken Tikka with Salad", "calories": 420, "protein_g": 36, "iron_mg": 3.5, "ingredients": "Yogurt-marinated chicken, spices, onion rings, mint chutney, naan"},
            {"name": "Vegetable Khichdi", "calories": 380, "protein_g": 14, "iron_mg": 4.0, "ingredients": "Rice, moong dal, ghee, turmeric, mixed vegetables, cumin"},
        ],
        "SNACK": [
            {"name": "Roasted Chana", "calories": 170, "protein_g": 10, "iron_mg": 3.0, "ingredients": "Roasted chickpeas, chaat masala, lemon juice"},
            {"name": "Lassi", "calories": 200, "protein_g": 8, "iron_mg": 0.5, "ingredients": "Yogurt, mango or rosewater, cardamom, sugar"},
            {"name": "Dates & Nuts Ladoo", "calories": 210, "protein_g": 5, "iron_mg": 2.0, "ingredients": "Dates, almonds, cashews, coconut, ghee, cardamom"},
        ],
    },
    "Morocco": {
        "BREAKFAST": [
            {"name": "Msemen with Honey & Cheese", "calories": 360, "protein_g": 12, "iron_mg": 2.5, "ingredients": "Semolina flatbread, honey, soft cheese, mint tea"},
            {"name": "Shakshuka Maghrebine", "calories": 340, "protein_g": 20, "iron_mg": 5.0, "ingredients": "Eggs, tomatoes, bell peppers, cumin, harissa, bread"},
            {"name": "Beghrir with Butter & Honey", "calories": 300, "protein_g": 8, "iron_mg": 2.0, "ingredients": "Semolina pancakes, melted butter, honey, orange juice"},
        ],
        "LUNCH": [
            {"name": "Chicken Tagine with Olives", "calories": 480, "protein_g": 32, "iron_mg": 4.0, "ingredients": "Chicken, preserved lemons, green olives, onions, saffron, couscous"},
            {"name": "Harira Soup", "calories": 380, "protein_g": 22, "iron_mg": 6.5, "ingredients": "Lentils, chickpeas, tomatoes, lamb, celery, cilantro, vermicelli"},
            {"name": "Couscous with Seven Vegetables", "calories": 450, "protein_g": 16, "iron_mg": 4.5, "ingredients": "Couscous, turnip, zucchini, carrots, pumpkin, chickpeas, raisins"},
        ],
        "DINNER": [
            {"name": "Fish Chermoula", "calories": 400, "protein_g": 30, "iron_mg": 3.0, "ingredients": "White fish, chermoula marinade, potatoes, tomatoes, lemon, olives"},
            {"name": "Lamb Kefta Tagine", "calories": 460, "protein_g": 28, "iron_mg": 5.5, "ingredients": "Lamb meatballs, tomato sauce, eggs, cumin, bread"},
            {"name": "Vegetable Briouats", "calories": 380, "protein_g": 12, "iron_mg": 3.5, "ingredients": "Filo pastry, spinach, feta, vermicelli, herbs, lentil soup side"},
        ],
        "SNACK": [
            {"name": "Dates & Almonds", "calories": 200, "protein_g": 5, "iron_mg": 1.5, "ingredients": "Medjool dates, roasted almonds, orange blossom water"},
            {"name": "Mint Tea & Gazelle Horns", "calories": 220, "protein_g": 4, "iron_mg": 1.0, "ingredients": "Almond paste cookies, mint tea, orange blossom"},
            {"name": "Avocado Smoothie", "calories": 240, "protein_g": 6, "iron_mg": 1.0, "ingredients": "Avocado, milk, dates, almonds, cinnamon"},
        ],
    },
    "South Korea": {
        "BREAKFAST": [
            {"name": "Miyeok-guk (Seaweed Soup)", "calories": 280, "protein_g": 18, "iron_mg": 4.5, "ingredients": "Dried seaweed, beef, sesame oil, soy sauce, rice, garlic"},
            {"name": "Gyeran-bap (Egg Rice)", "calories": 350, "protein_g": 16, "iron_mg": 3.0, "ingredients": "Steamed rice, fried egg, sesame oil, soy sauce, kimchi"},
            {"name": "Hobak-juk (Pumpkin Porridge)", "calories": 260, "protein_g": 6, "iron_mg": 2.0, "ingredients": "Sweet pumpkin, rice flour, red beans, honey"},
        ],
        "LUNCH": [
            {"name": "Bibimbap", "calories": 520, "protein_g": 24, "iron_mg": 6.0, "ingredients": "Rice, spinach, bean sprouts, carrot, zucchini, egg, beef, gochujang"},
            {"name": "Doenjang-jjigae", "calories": 380, "protein_g": 20, "iron_mg": 4.5, "ingredients": "Fermented soybean paste stew, tofu, zucchini, mushrooms, rice"},
            {"name": "Japchae", "calories": 420, "protein_g": 16, "iron_mg": 5.0, "ingredients": "Sweet potato noodles, spinach, beef, carrots, mushrooms, sesame oil"},
        ],
        "DINNER": [
            {"name": "Samgyetang (Ginseng Chicken)", "calories": 480, "protein_g": 36, "iron_mg": 4.0, "ingredients": "Whole chicken, ginseng, jujube, garlic, glutinous rice"},
            {"name": "Galbi-jjim (Braised Short Ribs)", "calories": 450, "protein_g": 30, "iron_mg": 5.5, "ingredients": "Beef short ribs, radish, carrots, chestnuts, soy sauce, rice"},
            {"name": "Kimchi-jjigae with Tofu", "calories": 360, "protein_g": 22, "iron_mg": 5.0, "ingredients": "Kimchi, tofu, pork belly, green onion, rice"},
        ],
        "SNACK": [
            {"name": "Hotteok", "calories": 220, "protein_g": 4, "iron_mg": 1.0, "ingredients": "Sweet pancake, brown sugar, cinnamon, sunflower seeds, peanuts"},
            {"name": "Tteok (Rice Cake)", "calories": 180, "protein_g": 3, "iron_mg": 0.8, "ingredients": "Glutinous rice, red bean paste, sesame seeds"},
            {"name": "Sikhye (Rice Drink)", "calories": 160, "protein_g": 2, "iron_mg": 0.5, "ingredients": "Sweet rice drink, pine nuts, malt barley"},
        ],
    },
    "France": {
        "BREAKFAST": [
            {"name": "Oeufs en Cocotte", "calories": 340, "protein_g": 20, "iron_mg": 3.5, "ingredients": "Baked eggs, cream, herbs, gruyère, whole grain toast soldiers"},
            {"name": "Tartine au Fromage Frais", "calories": 300, "protein_g": 14, "iron_mg": 2.0, "ingredients": "Sourdough bread, fromage frais, smoked salmon, chives, lemon"},
            {"name": "Crêpes aux Fruits", "calories": 320, "protein_g": 10, "iron_mg": 2.5, "ingredients": "Buckwheat crêpes, Greek yogurt, mixed berries, honey, almonds"},
        ],
        "LUNCH": [
            {"name": "Quiche Lorraine aux Épinards", "calories": 480, "protein_g": 22, "iron_mg": 4.5, "ingredients": "Whole wheat crust, eggs, cream, spinach, gruyère, bacon lardons"},
            {"name": "Salade Niçoise", "calories": 420, "protein_g": 28, "iron_mg": 3.5, "ingredients": "Tuna, green beans, potatoes, eggs, olives, anchovies, vinaigrette"},
            {"name": "Soupe de Lentilles", "calories": 380, "protein_g": 20, "iron_mg": 7.0, "ingredients": "Green lentils, carrots, leeks, herbes de Provence, crème fraîche"},
        ],
        "DINNER": [
            {"name": "Poulet Rôti aux Légumes", "calories": 450, "protein_g": 34, "iron_mg": 3.0, "ingredients": "Roasted chicken, root vegetables, thyme, garlic, Dijon mustard"},
            {"name": "Ratatouille avec Oeuf", "calories": 380, "protein_g": 16, "iron_mg": 3.5, "ingredients": "Eggplant, zucchini, tomatoes, bell peppers, poached egg, herbs"},
            {"name": "Saumon en Papillote", "calories": 420, "protein_g": 32, "iron_mg": 2.0, "ingredients": "Salmon fillet, asparagus, lemon, dill, cherry tomatoes, couscous"},
        ],
        "SNACK": [
            {"name": "Fromage et Fruits", "calories": 200, "protein_g": 10, "iron_mg": 0.5, "ingredients": "Comté cheese, grapes, walnuts, whole grain crackers"},
            {"name": "Yaourt au Miel", "calories": 180, "protein_g": 12, "iron_mg": 0.3, "ingredients": "Natural yogurt, lavender honey, toasted hazelnuts"},
            {"name": "Compote de Pommes", "calories": 160, "protein_g": 1, "iron_mg": 0.5, "ingredients": "Stewed apples, cinnamon, vanilla, almond flakes"},
        ],
    },
    "Tunisia": {
        "BREAKFAST": [
            {"name": "Lablabi (Chickpea Soup)", "calories": 360, "protein_g": 18, "iron_mg": 6.0, "ingredients": "Chickpeas, stale bread, harissa, cumin, olive oil, poached egg, lemon"},
            {"name": "Brik à l'Oeuf", "calories": 320, "protein_g": 16, "iron_mg": 3.5, "ingredients": "Thin pastry, egg, tuna, parsley, capers, lemon (baked version)"},
            {"name": "Ftayer bil Jben", "calories": 300, "protein_g": 14, "iron_mg": 2.0, "ingredients": "Semolina flatbread, ricotta, egg, olive oil, honey, orange blossom water"},
        ],
        "LUNCH": [
            {"name": "Couscous bil Khodra", "calories": 480, "protein_g": 18, "iron_mg": 5.5, "ingredients": "Couscous, chickpeas, pumpkin, carrots, turnip, zucchini, harissa broth"},
            {"name": "Shakshuka Tunisienne", "calories": 420, "protein_g": 22, "iron_mg": 5.0, "ingredients": "Eggs, tomatoes, merguez, bell peppers, harissa, cumin, bread"},
            {"name": "Tajine Tunisien (Frittata)", "calories": 400, "protein_g": 24, "iron_mg": 4.0, "ingredients": "Eggs, chicken, potatoes, parsley, turmeric, cheese, baked"},
        ],
        "DINNER": [
            {"name": "Poisson Complet (Grilled Fish)", "calories": 420, "protein_g": 32, "iron_mg": 3.0, "ingredients": "Sea bream, chermoula, roasted potatoes, mechouia salad, lemon"},
            {"name": "Marqa Loubia (White Bean Stew)", "calories": 400, "protein_g": 22, "iron_mg": 6.5, "ingredients": "White beans, lamb, tomatoes, harissa, cumin, olive oil, bread"},
            {"name": "Kamounia (Cumin Beef Stew)", "calories": 450, "protein_g": 28, "iron_mg": 7.0, "ingredients": "Beef, cumin, tomato paste, chickpeas, parsley, rice"},
        ],
        "SNACK": [
            {"name": "Bambalouni (Tunisian Donut)", "calories": 220, "protein_g": 4, "iron_mg": 1.0, "ingredients": "Fried dough ring, sugar, orange blossom water"},
            {"name": "Dattes et Amandes", "calories": 200, "protein_g": 5, "iron_mg": 2.0, "ingredients": "Deglet Nour dates, almonds, orange blossom water"},
            {"name": "Thé à la Menthe et Fruits Secs", "calories": 180, "protein_g": 4, "iron_mg": 1.5, "ingredients": "Mint tea, pine nuts, pistachios, dried figs"},
        ],
    },
    "Brazil": {
        "BREAKFAST": [
            {"name": "Tapioca com Queijo e Banana", "calories": 340, "protein_g": 14, "iron_mg": 2.0, "ingredients": "Tapioca flour crepe, minas cheese, banana, cinnamon, honey"},
            {"name": "Açaí Bowl", "calories": 380, "protein_g": 8, "iron_mg": 3.5, "ingredients": "Açaí purée, banana, granola, coconut flakes, honey, strawberries"},
            {"name": "Pão de Queijo com Vitamina", "calories": 350, "protein_g": 16, "iron_mg": 2.0, "ingredients": "Cheese bread, papaya-banana smoothie with oats and milk"},
        ],
        "LUNCH": [
            {"name": "Feijoada Light", "calories": 500, "protein_g": 30, "iron_mg": 8.0, "ingredients": "Black beans, lean pork, kale, rice, orange slices, farofa"},
            {"name": "Moqueca de Peixe", "calories": 450, "protein_g": 28, "iron_mg": 3.0, "ingredients": "White fish, coconut milk, dendê oil, tomatoes, bell peppers, rice"},
            {"name": "Salada de Frango com Mandioca", "calories": 420, "protein_g": 26, "iron_mg": 3.5, "ingredients": "Shredded chicken, cassava, green salad, palm hearts, vinaigrette"},
        ],
        "DINNER": [
            {"name": "Frango Grelhado com Purê", "calories": 430, "protein_g": 34, "iron_mg": 2.5, "ingredients": "Grilled chicken breast, sweet potato purée, steamed broccoli, lemon"},
            {"name": "Escondidinho de Carne", "calories": 460, "protein_g": 24, "iron_mg": 5.0, "ingredients": "Shredded beef, cassava purée, cheese, green salad"},
            {"name": "Sopa de Legumes com Carne", "calories": 380, "protein_g": 22, "iron_mg": 4.0, "ingredients": "Beef, potatoes, carrots, chayote, green beans, corn"},
        ],
        "SNACK": [
            {"name": "Mix de Castanhas", "calories": 200, "protein_g": 6, "iron_mg": 2.0, "ingredients": "Brazil nuts, cashews, dried mango, dark chocolate"},
            {"name": "Bolo de Banana Integral", "calories": 220, "protein_g": 5, "iron_mg": 1.5, "ingredients": "Whole wheat banana cake, oats, cinnamon, honey"},
            {"name": "Suco Verde", "calories": 150, "protein_g": 3, "iron_mg": 2.5, "ingredients": "Kale, pineapple, ginger, lemon, chia seeds, coconut water"},
        ],
    },
}

# Pregnancy tips per country
COUNTRY_TIPS = {
    "Italy": "Italian cuisine is naturally pregnancy-friendly! Focus on quality olive oil, leafy greens, and legumes. Avoid raw cured meats (prosciutto crudo) and unpasteurized cheeses 🇮🇹",
    "Japan": "Japanese cuisine is excellent during pregnancy — seaweed (miyeok) is traditionally eaten postpartum for recovery. Avoid raw fish (sashimi) and choose cooked options instead 🇯🇵",
    "Mexico": "Mexican food is packed with folate-rich beans and iron! Use fresh salsas over canned, choose corn tortillas for extra fiber, and ensure all meats are well-cooked 🇲🇽",
    "India": "Indian cuisine offers incredible iron and protein from lentils and legumes. Favor gentler spices like turmeric and cumin, and enjoy the calcium boost from paneer and yogurt 🇮🇳",
    "Morocco": "Moroccan tagines are slow-cooked and nutrient-dense. Dates provide natural iron, and harira soup is a traditional pregnancy superfood. Stay hydrated with mint tea 🇲🇦",
    "South Korea": "Korean fermented foods like kimchi support gut health during pregnancy! Miyeok-guk (seaweed soup) is the classic postpartum dish, rich in iodine and calcium 🇰🇷",
    "France": "French cuisine emphasizes quality over quantity. Enjoy lentils (rich in iron), seasonal vegetables, and well-cooked proteins. Avoid raw-milk cheeses and pâtés 🇫🇷",
    "Tunisia": "Tunisian cuisine is a hidden gem for pregnancy nutrition! Rich in olive oil, chickpeas, and cumin — all excellent for iron. Deglet Nour dates are a natural energy booster. Enjoy harissa in moderation for a spicy kick 🇹🇳",
    "Brazil": "Brazilian superfoods like açaí and castanha-do-pará (Brazil nuts) are packed with antioxidants and selenium. Black beans are an excellent iron source for pregnancy 🇧🇷",
}


class NutritionRequest(BaseModel):
    pregnancy_week: int
    dietary_restrictions: list[str] | None = None
    allergies: list[str] | None = None
    meal_type: str | None = None
    country: str | None = None


class MealSuggestion(BaseModel):
    meal_name: str
    meal_type: str
    calories: int
    protein_g: float
    iron_mg: float
    ingredients: str
    tip: str | None = None


class NutritionResponse(BaseModel):
    daily_targets: dict
    trimester: int
    suggestions: list[MealSuggestion]
    tip_of_the_day: str
    country: str | None = None


@router.post("/suggest", response_model=NutritionResponse)
async def suggest_nutrition(data: NutritionRequest):
    """Generate personalized nutrition suggestions for the current pregnancy stage."""
    trimester = 1 if data.pregnancy_week <= 12 else (2 if data.pregnancy_week <= 27 else 3)
    targets = NUTRIENT_TARGETS[trimester]

    # Pick the right meal database
    if data.country and data.country in COUNTRY_MEALS:
        meal_db = COUNTRY_MEALS[data.country]
    else:
        meal_db = MEAL_SUGGESTIONS

    suggestions = []
    meal_types = [data.meal_type] if data.meal_type else ["BREAKFAST", "LUNCH", "DINNER", "SNACK"]

    for mt in meal_types:
        meals = list(meal_db.get(mt, []))
        # Filter by allergies
        if data.allergies:
            meals = [m for m in meals if not any(a.lower() in m["ingredients"].lower() for a in data.allergies)]
        if meals:
            meal = random.choice(meals)
            suggestions.append(MealSuggestion(
                meal_name=meal["name"],
                meal_type=mt,
                calories=meal["calories"],
                protein_g=meal["protein_g"],
                iron_mg=meal["iron_mg"],
                ingredients=meal["ingredients"],
                tip=_get_meal_tip(mt, trimester),
            ))

    # Country-specific tip or default
    if data.country and data.country in COUNTRY_TIPS:
        tip = COUNTRY_TIPS[data.country]
    else:
        tip = _get_daily_tip(trimester, data.pregnancy_week)

    return NutritionResponse(
        daily_targets=targets,
        trimester=trimester,
        suggestions=suggestions,
        tip_of_the_day=tip,
        country=data.country,
    )


def _get_meal_tip(meal_type: str, trimester: int) -> str:
    tips = {
        "BREAKFAST": "Start your day with protein to combat morning sickness 🌅",
        "LUNCH": "Include leafy greens for iron and folate 🥬",
        "DINNER": "Pair iron-rich foods with vitamin C for better absorption 🍊",
        "SNACK": "Keep healthy snacks nearby to maintain energy levels 🥜",
    }
    return tips.get(meal_type, "")


def _get_daily_tip(trimester: int, week: int) -> str:
    tips = {
        1: "During trimester 1, focus on folic acid (600mcg/day) to support neural tube development. Small frequent meals help with nausea 🌸",
        2: "Trimester 2 is growth time! Increase calcium and vitamin D intake. Your baby's bones are forming 🦴",
        3: "In trimester 3, you need extra calories (~300/day more). Focus on omega-3 DHA for brain development 🧠",
    }
    return tips.get(trimester, "Stay hydrated and eat a rainbow of fruits and vegetables! 🌈")
