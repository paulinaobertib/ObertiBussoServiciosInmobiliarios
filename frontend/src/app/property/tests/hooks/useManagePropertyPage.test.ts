import { renderHook, act, waitFor } from "@testing-library/react";
import { vi, Mock } from "vitest";
import { useManagePropertyPage } from "../../hooks/useManagePropertyPage";
import * as propertyService from "../../services/property.service";
import * as ownerService from "../../services/owner.service";
import * as imageService from "../../../shared/components/images/image.service";
import { usePropertiesContext } from "../../context/PropertiesContext";
import { useImages } from "../../../shared/hooks/useImages";
import { useConfirmDialog } from "../../../shared/components/ConfirmDialog";
import { useGlobalAlert } from "../../../shared/context/AlertContext";
import { useNavigate, useParams } from "react-router-dom";

vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
  useParams: vi.fn(),
}));
vi.mock("../../services/property.service");
vi.mock("../../services/owner.service");
vi.mock("../../../shared/components/images/image.service");
vi.mock("../../../shared/hooks/useImages");
vi.mock("../../context/PropertiesContext");
vi.mock("../../../shared/components/ConfirmDialog");
vi.mock("../../../shared/context/AlertContext");

describe("useManagePropertyPage", () => {
  const mockNavigate = vi.fn();
  const mockAsk = vi.fn((_: string, cb?: () => any) => {
    if (cb) cb();
  });
  const mockShowAlert = vi.fn();
  const mockSetSelected = vi.fn();
  const mockResetSelected = vi.fn();
  const mockSetMain = vi.fn();
  const mockAddToGallery = vi.fn();
  const mockRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as unknown as Mock).mockReturnValue(mockNavigate);
    (useParams as unknown as Mock).mockReturnValue({ id: "1" });

    (useConfirmDialog as unknown as Mock).mockReturnValue({
      ask: mockAsk,
      DialogUI: () => null,
    });
    (useGlobalAlert as unknown as Mock).mockReturnValue({
      showAlert: mockShowAlert,
      confirm: vi.fn().mockResolvedValue(true),
    });
    (usePropertiesContext as unknown as Mock).mockReturnValue({
      setSelected: mockSetSelected,
      resetSelected: mockResetSelected,
      selected: { owner: 1, type: 2, neighborhood: 3, amenities: [4] },
    });
    (useImages as unknown as Mock).mockReturnValue({
      mainImage: null,
      gallery: [],
      setMain: mockSetMain,
      addToGallery: mockAddToGallery,
      remove: mockRemove,
    });

    (propertyService.postProperty as unknown as Mock) = vi.fn();
    (propertyService.putProperty as unknown as Mock) = vi.fn();
    (ownerService.getOwnerByPropertyId as unknown as Mock) = vi.fn();
    (propertyService.getPropertyById as unknown as Mock) = vi.fn();
    (imageService.getImagesByPropertyId as unknown as Mock) = vi.fn();
    (imageService.postImage as unknown as Mock) = vi.fn();
    (imageService.deleteImageById as unknown as Mock) = vi.fn();
  });

  it("removeImage con string marca para borrado y actualiza galería", () => {
    const dto = { id: 99, url: "img.jpg" };
    (imageService.getImagesByPropertyId as unknown as Mock).mockResolvedValue([dto]);
    const { result } = renderHook(() => useManagePropertyPage());
    act(() => {
      result.current.img.remove("img.jpg");
    });
    expect(mockRemove).toHaveBeenCalledWith("img.jpg");
  });

  it("removeImage con File solo llama remove", () => {
    const file = new File([""], "pic.png");
    const { result } = renderHook(() => useManagePropertyPage());
    act(() => {
      result.current.img.remove(file);
    });
    expect(mockRemove).toHaveBeenCalledWith(file);
  });

  it("handleImages setea main y galería", () => {
    const { result } = renderHook(() => useManagePropertyPage());
    const file = new File([""], "f.png");
    act(() => {
      result.current.handleImages(file, [file]);
    });
    expect(mockSetMain).toHaveBeenCalledWith(file);
    expect(mockAddToGallery).toHaveBeenCalledWith([file]);
  });

  it("title cambia según property", async () => {
    const fakeProp = { id: 1, type: { id: 2, name: "Casa" }, mainImage: "" };
    (propertyService.getPropertyById as unknown as Mock).mockResolvedValue(fakeProp);
    (ownerService.getOwnerByPropertyId as unknown as Mock).mockResolvedValue({ id: 1 });
    (imageService.getImagesByPropertyId as unknown as Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useManagePropertyPage());

    await waitFor(() => {
      expect(result.current.title).toContain("Edición");
    });
  });

  it("canProceed refleja selección", () => {
    (usePropertiesContext as unknown as Mock).mockReturnValue({
      setSelected: vi.fn(),
      resetSelected: vi.fn(),
      selected: { owner: 0, type: null, neighborhood: null, amenities: [] },
    });
    const { result } = renderHook(() => useManagePropertyPage());
    expect(result.current.canProceed).toBe(false);
  });

  it("title en modo creación es 'Alta de Propiedad'", () => {
    (useParams as unknown as Mock).mockReturnValueOnce({});
    const { result } = renderHook(() => useManagePropertyPage());
    expect(result.current.title).toBe("Alta de Propiedad");
  });

  it("permite setear activeStep y formReady", () => {
    const { result } = renderHook(() => useManagePropertyPage());
    act(() => {
      result.current.setActiveStep(1);
      result.current.setFormReady(true);
    });
    expect(result.current.activeStep).toBe(1);
    expect(result.current.formReady).toBe(true);
  });

  it("canProceed es true cuando selección está completa y con amenities", () => {
    (usePropertiesContext as unknown as Mock).mockReturnValueOnce({
      setSelected: vi.fn(),
      resetSelected: vi.fn(),
      selected: { owner: 1, type: 1, neighborhood: 1, amenities: [2] },
    });
    const { result } = renderHook(() => useManagePropertyPage());
    expect(result.current.canProceed).toBe(true);
  });

  it("carga propiedad, owner e imágenes al editar", async () => {
    const fakeProp = {
      id: 1,
      type: { id: 2, name: "Casa" },
      neighborhood: { id: 3 },
      mainImage: "main.jpg",
      amenities: [{ id: 4 }],
    };
    const fakeOwner = { id: 10 };
    const fakeImages = [{ id: 5, url: "img1.jpg" }];

    (propertyService.getPropertyById as unknown as Mock).mockResolvedValue(fakeProp);
    (ownerService.getOwnerByPropertyId as unknown as Mock).mockResolvedValue(fakeOwner);
    (imageService.getImagesByPropertyId as unknown as Mock).mockResolvedValue(fakeImages);

    const { result } = renderHook(() => useManagePropertyPage());

    await waitFor(() => expect(result.current.property?.id).toBe(1));
    expect(mockSetSelected).toHaveBeenCalledWith({
      owner: 10,
      type: 2,
      neighborhood: 3,
      amenities: [4],
      address: {
        street: "",
        number: "",
        latitude: null,
        longitude: null,
      },
    });
    expect(mockSetMain).toHaveBeenCalledWith("main.jpg");
    expect(mockAddToGallery).toHaveBeenCalledWith(["img1.jpg"]);
  });

  it("save con form inválido muestra alerta y no llama servicios", async () => {
    const fakeForm = {
      submit: vi.fn().mockResolvedValue(false),
      getCreateData: vi.fn(),
      setField: vi.fn(),
    };
    const { result } = renderHook(() => useManagePropertyPage());
    result.current.formRef.current = fakeForm;

    await act(async () => {
      await result.current.save();
    });

    expect(mockShowAlert).toHaveBeenCalledWith("Formulario inválido, faltan datos", "warning");
    expect(propertyService.postProperty).not.toHaveBeenCalled();
  });

  it("cancel pregunta confirmación y navega", async () => {
    const { result } = renderHook(() => useManagePropertyPage());
    await act(async () => {
      await result.current.cancel();
    });
    expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
  });
});
