import type { ColorInputSelectOption } from "@/components/ColorInputSelect/ColorInputSelect";
import type { DropdownMenuOption } from "@/components/DropdownMenu/DropdownMenu";
import type { InputWithVariantOption } from "@/components/InputWithVariant/InputWithVariant";

export const carFormSteps = [
  { value: "media", label: "Медиа" },
  { value: "main", label: "Основная информация" },
  { value: "equipment", label: "Комплектация" },
  { value: "damages", label: "Повреждения" }
] as const;

export const fuelTypeOptions: DropdownMenuOption[] = [
  { value: "petrol", label: "Бензин" },
  { value: "diesel", label: "Дизель" },
  { value: "hybrid", label: "Гибрид" },
  { value: "electric", label: "Электро" }
];

export const transmissionOptions: DropdownMenuOption[] = [
  { value: "automatic", label: "Автомат" },
  { value: "manual", label: "Механика" },
  { value: "robot", label: "Робот" },
  { value: "cvt", label: "Вариатор" }
];

export const driveTypeOptions: DropdownMenuOption[] = [
  { value: "fwd", label: "Передний" },
  { value: "rwd", label: "Задний" },
  { value: "awd", label: "Полный" }
];

export const bodyTypeOptions: DropdownMenuOption[] = [
  { value: "sedan", label: "Седан" },
  { value: "suv", label: "Кроссовер" },
  { value: "wagon", label: "Универсал" },
  { value: "hatchback", label: "Хэтчбек" },
  { value: "coupe", label: "Купе" }
];

export const ptsTypeOptions: DropdownMenuOption[] = [
  { value: "paper", label: "Бумажный" },
  { value: "electronic", label: "Электронный" }
];

export const identificationNumberVariantOptions: InputWithVariantOption[] = [
  { value: "vin", label: "VIN" },
  { value: "frame", label: "Frame" }
];

export const powerUnitVariantOptions: InputWithVariantOption[] = [
  { value: "hp", label: "л.с." },
  { value: "kw", label: "кВт" }
];

export const mileageUnitVariantOptions: InputWithVariantOption[] = [
  { value: "km", label: "км" },
  { value: "miles", label: "мили" },
  { value: "m-h", label: "м/ч" }
];

export const carColorOptions: ColorInputSelectOption[] = [
  { value: "black", label: "Черный", gradient: "linear-gradient(135deg, #2f3338 0%, #0f1113 100%)" },
  { value: "white", label: "Белый", gradient: "linear-gradient(135deg, #ffffff 0%, #e7ecf2 100%)" },
  { value: "silver", label: "Серебристый", gradient: "linear-gradient(135deg, #f1f4f7 0%, #9ea6b0 100%)" },
  { value: "gray", label: "Серый", gradient: "linear-gradient(135deg, #b4bcc6 0%, #656f7c 100%)" },
  { value: "blue", label: "Синий", gradient: "linear-gradient(135deg, #5ca4ff 0%, #1f3f8a 100%)" },
  { value: "red", label: "Красный", gradient: "linear-gradient(135deg, #ff7c7c 0%, #8c1f1f 100%)" },
  { value: "green", label: "Зеленый", gradient: "linear-gradient(135deg, #7bd89a 0%, #1d6d3c 100%)" },
  { value: "yellow", label: "Желтый", gradient: "linear-gradient(135deg, #ffe98e 0%, #c08a00 100%)" },
  { value: "brown", label: "Коричневый", gradient: "linear-gradient(135deg, #c59467 0%, #6f4528 100%)" },
  { value: "beige", label: "Бежевый", gradient: "linear-gradient(135deg, #f2ddc2 0%, #b89363 100%)" },
  { value: "orange", label: "Оранжевый", gradient: "linear-gradient(135deg, #ffb56b 0%, #cf4f00 100%)" },
  { value: "purple", label: "Фиолетовый", gradient: "linear-gradient(135deg, #caa0ff 0%, #5b2f8f 100%)" }
];
