export default function Footer({ companyName, year }) {
    return (
        <div className="mt-3">
            <div className="rounded-xl bg-slate-100 p-3 text-center text-slate-700 shadow-sm">
                &copy; {year} {companyName} . All rights reserved.
            </div>
        </div>
    )
}