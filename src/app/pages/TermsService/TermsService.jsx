import Box from '@mui/material/Box';
import "./TermsService.css";
import { ArrowLeft} from 'lucide-react';
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from '@mui/material/Button';

export default function TermsService() {
    const { pathname } = useLocation();
    const location = useLocation();
    const navigate = useNavigate();
    const previousRoute = location.state?.previousRoute || "";

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    const handleBackClick = () => {
        if (previousRoute && previousRoute.trim() !== "") {
            navigate(previousRoute);
        } else {
            navigate("/");
        }
    };

    return (
    <div className="TermsService-page-wrapper">
        <Button
            onClick={handleBackClick}
            sx={{
                position: 'absolute',
                top: '80px',
                left: '50%',
                transform: 'translateX(calc(-50% - 540px))',
                color: '#1e293b',
                minWidth: 'auto',
                padding: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                borderRadius: '12px',
                '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                    transform: 'translateX(calc(-50% - 540px)) scale(1.05)'
                },
                transition: 'all 0.3s ease',
                zIndex: 1000
            }}
            >
            <ArrowLeft size={28}/>
        </Button>
        <Box className="TermsService-term-container">
        <div className="TermsService-header">
            <h1>WiNG.it Terms of Service</h1>
            <p className="TermsService-last-updated">Last updated: October 16, 2025</p>
        </div>

        <div className="content">
            <section className="TermsService-intro-section">
            <p>
                These terms of service are entered into between you and WiNG.it, LLC (“us” “we” or “our”) for the use of our application in relation to our training tools. By accessing our websites (the "Services"), you acknowledge that you have read, understood, and agree to the most recent version of these Terms of Service ("Terms").
            </p>

            <p>
                We reserve the right to revise these Terms at any time. If we do, we will post the modified Terms on this page and indicate the date of most the recent change above. You agree to read all notifications we send you and to periodically check this page for updates to these Terms. Your continued use of the Services constitutes acceptance of these Terms and any modifications thereto. If you object to any changes, your sole recourse is to cease use of the Services.
            </p>
            </section>

            <section className="TermsService-term-section">
            {/* Use of Services */}
            <h2>Use of Services</h2>
            <p>
                You agree that by using our Services, you have accepted these Terms and understand your obligations herein and under the Privacy Policies. You further agree that you are authorized to use our Services for your sole benefit. We reserve the right, at our sole discretion, to terminate any transactions or activities where we believe that the activities violate these Terms, Privacy Policies, or any laws. Notification of termination may be given at our discretion.
            </p>
            <p>
                <strong>Restrictions: </strong>You agree that the use of our Service must not involve any activities that are dangerous, harmful, fraudulent, deceptive, threatening, harassing, defamatory, or obscene. You are prohibited from attempting to obtain any password, account, or security information belonging to another user. Running autoresponders, spam, or any process that operates that interferes with the Service’s operation (including placing an undue load on its infrastructure) is not allowed. You must not use the Service in violation of any law or regulation, nor directly compete with WiNG.it. Activities such as attempting to decompile, reverse engineer, or discover the source code or underlying ideas of the Service, are strictly forbidden.
            </p>
            <p>
                <strong>Content: </strong>"Content" refers to all software, images, questions, communications, solutions, and any related material perceived or made available from our Service platform. Content delivered through our Services platform may be owned by us (“Our Content”). You agree to abide by all copyright notices and restrictions in the Content you access. Unless otherwise specified in writing, all Our Content is owned, controlled, or licensed by us. You agree that all Content is our sole and exclusive property, which includes all software, images, questions, solutions, or any material associated with the Service platform. All Our Content is copyrighted under United States copyright laws and/or similar laws of other jurisdictions, protecting it from unauthorized use.
            </p>
            <p>
                You agree that by submitting any User Submitted Content to our Service platform, you grant us a worldwide, non-exclusive, royalty-free, perpetual, and irrevocable license to use, reproduce, modify, distribute, display, and perform it in connection with the Services platform, to commercially exploit all such User Submitted Content, and to use it for any other purposes, without restriction or compensation to you. You also understand and agree that this right will persist even if your User Submitted Content is subsequently removed by you or if you subsequently delete your account with our Service.
            </p>

            {/* Account Information */}
            <h2>Account Information</h2>
            <p>
                <strong>Registration: </strong>We may ask you to register an account for the use of our services. In registering, you may elect to create an account with us or, if possible, create an account via a third party service such as Google. You understand and acknowledge that if you create an account using any third party services, you will be subject to those terms and conditions as well as privacy policies in connection with the use of our Services. You agree to familiarize yourself with any obligations under the conditions set forth by using the third party services as it relates to registration.
            </p>
            <p>
                <strong>Terms of Account: </strong>You may be required to register an account with us for the proposes of using our services. You agree that the information you provide is accurate to the best of your knowledge. You will be required certain personal information to us as part of your account. You agree to maintain the information as to its accuracy. Failure to maintain an up-to-date account may result in your inability to use our services. You are solely responsible for all activity that occurs on your account.
            </p>
            <p>
                <strong>Use of Account: </strong>You agree to use your account exclusively for the benefit of our services. You further agree that you do not allow any third party to use your account or use your account for any services not associated with your personal property or property for which you have lawful control. You agree that you will use our services for only lawful activities. You agree, as needed, to offer proof of identity in completing the services to ensure that you match the details on the account.
            </p>
            <p>
                <strong>Privacy: </strong>The terms of your account shall be protected by our privacy policy including any user generated material or confidential information provided as part of your account. To learn more about how we use your data, please refer to our privacy policy which is incorporated into this agreement by reference.
            </p>

            {/* Banking Activities */}
            <h2>Banking Activities</h2>
            <p>
                We utilize third party services for the purposes of processing any funds as part of our services. We do not track or retain any information regarding the use of your banking information including but not limited to user names and passwords. We do not accept any liability or security for the use of our services as it relates to the protection of your banking information. Although we strive to protect your information, you use our services AS IS and accept all liability and risk of using our services and third party services. You have the sole responsibility of ensuring that you take necessary precautions to protect your private information.
            </p>

            {/* Warranties and Limitations on Liability */}
            <h2>Warranties and Limitations on Liability</h2>
            <p>
                USE OF THE SERVICES IS AT YOUR OWN RISK. THE SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. WE EXPRESSLY DISCLAIM ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF TITLE, MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT.
            </p>
            <p>
                WE MAKE NO WARRANTY THAT (i) THE SERVICES OR ANY PRODUCTS PURCHASED THROUGH THE SERVICES WILL MEET YOUR REQUIREMENTS; (ii) THE SERVICES WILL BE UNINTERRUPTED, TIMELY, SECURE OR ERROR-FREE; OR (iii) THAT THE SERVICE WILL BE ERROR FREE OR THAT WE WILL FIX ANY ERRORS. ANY MATERIALS OBTAINED THROUGH USE OF THE SERVICES ARE OBTAINED AT YOUR OWN DISCRETION AND RISK AND THE COMPANY SHALL NOT BE RESPONSIBLE FOR ANY DAMAGE CAUSED TO YOUR COMPUTER OR DATA OR FOR ANY BUGS, VIRUSES, TROJAN HORSES OR OTHER DESTRUCTIVE CODE RESULTING FROM USE OF THE SERVICES OR ANY CONTENT OBTAINED FROM THE SERVICES. SOME STATES DO NOT ALLOW THE EXCLUSION OF IMPLIED WARRANTIES, SO THE ABOVE EXCLUSION MAY NOT APPLY TO YOU. YOU MAY ALSO HAVE OTHER LEGAL RIGHTS, WHICH VARY FROM STATE TO STATE.
            </p>
            <p>
                TO THE FULLEST EXTENT PERMITTED UNDER LAW, WE HAVE NO OBLIGATION OR LIABILITY (WHETHER ARISING IN CONTRACT, WARRANTY, TORT (INCLUDING NEGLIGENCE), PRODUCT LIABILITY OR OTHERWISE) FOR ANY INDIRECT, INCIDENTAL, SPECIAL, PUNITIVE, OR CONSEQUENTIAL DAMAGES OR LIABILITIES (INCLUDING, BUT NOT LIMITED TO, ANY LOSS OF DATA, REVENUE OR PROFIT) ARISING FROM OR RELATED TO YOUR USE OF THE SERVICES OR ANY CONTENT PROVIDED BY OR THROUGH THE SERVICES, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES IN ADVANCE. THE FOREGOING LIMITATION APPLIES TO DAMAGES ARISING FROM (i) YOUR USE OR INABILITY TO USE OUR SERVICES; (ii) COST OF PROCUREMENT OF SUBSTITUTE GOODS AND SERVICES RESULTING FROM ANY GOODS OR SERVICES PURCHASED THROUGH OR FROM OUR SERVICES; (iii) THIRD PARTY CONTENT MADE AVAILABLE TO YOU THROUGH THE SERVICES; OR (iv) ANY OTHER MATTER RELATING TO THE SERVICES. SOME STATES DO NOT ALLOW THE LIMITATION OR EXCLUSION OF INCIDENTAL, CONSEQUENTIAL OR OTHER TYPES OF DAMAGES, SO SOME OF THE ABOVE LIMITATIONS MAY NOT APPLY TO YOU.
            </p>
            <p>
                NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED HEREIN, OUR LIABILITY AND THE LIABILITY OF EACH OF OUR OFFICERS, MANAGERS, INVESTORS, EMPLOYEES, AGENTS, ADVERTISERS, LICENSORS, SUPPLIERS, SERVICE PROVIDERS AND OTHER CONTRACTORS TO YOU OR ANY THIRD PARTIES UNDER ANY CIRCUMSTANCE IS LIMITED TO A MAXIMUM AMOUNT OF $500.
            </p>
            <p>
                CERTAIN STATE LAWS DO NOT ALLOW LIMITATIONS ON IMPLIED WARRANTIES OR THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES. IF THESE LAWS APPLY TO YOU, SOME OR ALL OF THE ABOVE DISCLAIMERS, EXCLUSIONS, OR LIMITATIONS MAY NOT APPLY TO YOU, AND YOU MIGHT HAVE ADDITIONAL RIGHTS.
            </p>

            {/* Dispute Resolution */}
            <h2>Dispute Resolution</h2>
            <p>
                <strong>Procedure: </strong>You agree that any dispute shall be settled via arbitration and that arbitration will be administered by Judicial Arbitration & Mediation Services, Inc. (“JAMS”) pursuant to its Streamlined Arbitration Rules & Procedures (the “JAMS Rules”). You agree that the arbitrator shall have the power to decide any motions brought by any party to the arbitration, including motions for summary judgment and/or adjudication and motions to dismiss and demurrers applying the standards set forth under the California Code of Civil Procedure. You agree that the arbitrator shall issue a written decision on the merits. You also agree that the arbitrator shall have the final power to award any remedies available under applicable law, and that the arbitrator shall award Attorney’s fees and costs to the prevailing party where provided by applicable law. You agree that the decree or award rendered by the arbitrator may be entered as a final and binding judgment in any court having jurisdiction thereof. You agree that the arbitrator shall administer and conduct any arbitration in accordance with California LAW, including the California Code of Civil Procedure and the California evidence code, and that the arbitrator shall apply substantive and procedural California law to any dispute or claim, without reference to rules of conflict of law. To the extent that the JAMS Rules conflict with California law, California law shall take precedence. You further agree that any arbitration under this agreement shall be conducted in the City and County of Denver, California.
            </p>
            <p>
                YOU AGREE THAT ANY LEGAL CLAIM AGAINST US MUST BE FILED WITHIN SIX MONTHS AFTER THE EVENT THAT GAVE RISE TO YOUR LAWSUIT. OTHERWISE, YOUR LAWSUIT WILL BE PERMANENTLY BARRED.
            </p>
            <p>
                <strong>Remedy: </strong>Except as otherwise provided by law, the arbitrator shall be the sole, exclusive, and final remedy for any dispute between you and us. Neither you nor we will be permitted to pursue court action regarding claims that are subject to arbitration.
            </p>
            <p>
                <strong>Class Action: </strong>Class Action. You and we agree that any and all claims may be brought solely in each other's individual capacity and not in the capacity as a class for litigation purposes. You and we further agree that the arbitrator may not consolidate more than your or our claims specifically as they relate to one another.
            </p>

            {/* Miscellaneous */}
            <h2>Miscellaneous</h2>
            <p>
                <strong>Governing Law; Consent to Personal Jurisdiction: </strong>This Agreement shall be governed by the laws of the State of California, without regard to the conflicts of law provisions of any jurisdiction. To the extent that any lawsuit is permitted under this Agreement, you hereby expressly consent to the personal and exclusive jurisdiction and venue of the state and federal courts located in Alameda County, California.
            </p>
            <p>
                <strong>Force Majure: </strong>We shall not be liable for any delay or failure to perform resulting from causes outside the reasonable control of we, including without limitation any failure to perform hereunder due to unforeseen circumstances or cause beyond our control such as acts of God, war, riots, fire, floods, natural disaster, extreme weather, criminal activity, accident, alien invasion, act of government or terrorism, embargoes, network infrastructure failures, strikes, disruptions in communications including wireless and telecommunication, or any other disruption to our abilities to provide our services to the extent that the disruption is beyond our control.
            </p>
            <p>
                <strong>Entire Agreement: </strong>This Agreement constitutes the entire agreement and understanding between you and us with respect to the subject matter herein and supersedes all prior written and oral agreements, discussions, or representations between the you and us.
            </p>
            <p>
                <strong>Severability: </strong>If any portion of these terms is deemed to be invalid or unenforceable, such provision will be enforced to the maximum extent permissible so as to effect the intent of you and us, and the remainder of these terms will continue in full force and effect.
            </p>
            <p>
                <strong>Modification, Waiver: </strong>No modification of or amendment to these terms, nor any waiver of any rights under these terms, will be effective unless expressly agreed upon by us. Waiver by us of a breach of any provision of these terms will not operate as a waiver of any other or subsequent breach.
            </p>
            <p>If you need to contact us, email us at <a href="mailto:wingit.space@gmail.com">wingit.space@gmail.com</a></p>
            </section>
        </div>
        </Box>
    </div>
  );
}