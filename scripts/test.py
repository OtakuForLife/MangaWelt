

titles = [
    "Gamers! Light Novel, Band 01",
    "Anyway, I Love You, Band 07",
    "Is It Wrong to Try to Pick Up Girls in a Dungeon? - Light Novel, Band 08 ",
    "Shunkan Lyle, Band 04 (Abschlussband) + Box",
    "KONOSUBA! GOD'S BLESSING ON THIS WONDERFUL WORLD! - Light Novel, Band 06 "
]
postfixes_to_remove = [
        " - Light Novel",
        " 2in1",
        " (Einzelband)",
    ]

for title in titles:
    franchise = ",".join(title.split(",")[:-1]).strip() if title else "None"
    for postfix in postfixes_to_remove:
        if franchise.endswith(postfix):
            franchise = franchise[:-len(postfix)].strip()
    print(franchise)

Label = "Test 1234"
print("123" in Label)