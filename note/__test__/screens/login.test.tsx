import LoginScreen from "@/app/auth/login";
import { render } from "@testing-library/react-native";

jest.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({
    userToken: null,
    user: null,
    signIn: jest.fn(),
    signOut: jest.fn(),
    isLoading: false,
  }),
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

describe("LoginScreen", () => {
  test("Afficher les champs de formulaire", () => {
    const { getByPlaceholderText, getAllByText } = render(<LoginScreen />);

    expect(getByPlaceholderText("Email")).toBeTruthy();
    expect(getByPlaceholderText("Mot de passe")).toBeTruthy();

    expect(getAllByText("Connexion").length).toBeGreaterThan(0);
    expect(getAllByText("Scanner un QR Code").length).toBeGreaterThan(0);
  });
});
