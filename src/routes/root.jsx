import { 
    Outlet, 
    NavLink, 
    useLoaderData,
    Form, 
    redirect,
    useNavigation,
    useSubmit,
} from "react-router-dom";
import { getContacts, createContact } from "../contacts";
import { useEffect } from "react";

export async function action() {
    const contact = await createContact();
    return redirect(`/contacts/${contact.id}/edit`);
}

export async function loader({ request }) {
    const url = new URL(request.url);
    const q = url.searchParams.get("q");
    const contacts = await getContacts(q);
    return { contacts, q };
}

export default function Root() {
    const { contacts, q } = useLoaderData();
    const navigation = useNavigation();
    const submit = useSubmit();

    const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has(
        "q"
    ); //to make the searching sign available in the input field

    useEffect(() => {
        document.getElementById("q").value = q;
        //this is for updating the input
    }, [q]);

    return (
        <>
            <div id="sidebar">
            <h1>React Router Contacts</h1>
            <div>
                <Form id="search-form" role="search">
                    <input
                        id="q"
                        className={searching ? "loading" : ""} //to make the searching sign available in the input field
                        aria-label="Search contacts"
                        placeholder="Search"
                        type="search"
                        name="q"
                        defaultValue={q}
                        onChange={(event) => {
                            const isFirstSearch = q == null;
                            submit(event.currentTarget.form, { 
                                replace: !isFirstSearch,
                            });
                            //so that filtering can happen on every key stroke 
                            // and for replacing the current entry in the history 
                            //stack with the next page, instead of pushing into it.
                        }} 
            
                    />
                    <div
                        id="search-spinner"
                        aria-hidden
                        //hidden={true}
                        hidden={!searching} //to make the searching sign available in the input field
                    />
                    <div
                        className="sr-only"
                        aria-live="polite"
                    ></div>
                </Form>

                <Form method="post">
                    <button type="submit">New</button>
                </Form>
            </div>
            <nav>
            {contacts.length ? (
            <ul>
                {contacts.map((contact) => (
                    <li key={contact.id}>
                    <NavLink to={`contacts/${contact.id}`}
                    className={({ isActive, isPending }) =>
                        isActive
                            ? "active"
                            : isPending
                            ? "pending"
                            : ""
                    }>

                        {contact.first || contact.last ? (
                        <>
                            {contact.first} {contact.last}
                        </>
                        ) : (
                        <i>No Name</i>
                        )}{" "}
                        {contact.favorite && <span>★</span>}

                    </NavLink>
                    </li>
                ))}
                </ul>
            ) : (
                <p>
                <i>No contacts</i>
                </p>
            )}
            </nav>
            </div>
            <div 
                id="detail"
                className={
                    navigation.state === "loading" ? "loading" : ""
                }>
                <Outlet />
            </div>
        </>
        );
    }