

const MATERIALS_KEY = "materials";


const initialMaterials = [
    {
        id: "1",
        courseId: "1",
        title: "Лекции по алгебре (PDF)",
        link: "https://example.com/algebra.pdf"
    },
    {
        id: "2",
        courseId: "2",       // курс "Физика"
        title: "Презентация по кинематике",
        link: "https://example.com/kinematics.ppt"
    }
];

function saveAllMaterials(list) {
    localStorage.setItem(MATERIALS_KEY, JSON.stringify(list));
}

export function getAllMaterials() {
    const data = localStorage.getItem(MATERIALS_KEY);
    if (!data) {
        localStorage.setItem(MATERIALS_KEY, JSON.stringify(initialMaterials));
        return initialMaterials;
    }
    try {
        return JSON.parse(data);
    } catch (e) {
        console.error("Ошибка парсинга materials", e);
        return [];
    }
}

export function createMaterial(materialData) {
    const list = getAllMaterials();
    const newId = String(Date.now());
    const newMat = { id: newId, ...materialData };
    list.push(newMat);
    saveAllMaterials(list);
    return newMat;
}

export function deleteMaterial(id) {
    let list = getAllMaterials();
    list = list.filter((item) => item.id !== id);
    saveAllMaterials(list);
}

export function getMaterialsByCourse(courseId) {
    const list = getAllMaterials();
    return list.filter((item) => item.courseId === courseId);
}
