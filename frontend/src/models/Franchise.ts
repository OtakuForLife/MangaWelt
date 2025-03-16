export default interface Franchise {
    id: string;
    title: string;
    description: string;
    image: string;
    products: string[]; // array of product ISBNs
    is_following: boolean;
}