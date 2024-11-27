const QuestionButton = ({ label }) => (
    <button
        className="
            rounded-2xl bg-gradient-to-r from-color6BAEDB to-colorACD9DB
            w-full text-color282523 font-satoshi shadow-[0_9px_#1d3557]
            text-black text-lg px-6 py-4 hover:from-color307999
            hover:to-color6EAFCC active:bg-color7DBE73 
            active:shadow-[0_5px_#1d3557] active:translate-y-1 focus:outline-none
        ">
        {label}
    </button>
);

export default QuestionButton;