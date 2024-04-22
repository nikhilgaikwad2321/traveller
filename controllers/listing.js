const Listing=require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geoCodingClient = mbxGeocoding({ accessToken: mapToken});

module.exports.index= async (req,res)=>{
    const listings=await Listing.find({});
    res.render("listings/index.ejs",{listings});
};

module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.showListing=async (req,res)=>{
    let { id }=req.params;
    let listing=await Listing.findById(id).populate({
        path:"reviews",
    populate:{
        path:"author",
    }
    })
    .populate("owner");
    
    if(!listing){
        req.flash("error","Listing you requested doesnt exist");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
};

module.exports.createListing=async (req,res,next)=>{
    // let { title,description,image,price,country,location}=req.body;

    //geocoding sending request to a api
    let response=await geoCodingClient
        .forwardGeocode({
            query:req.body.listing.location,
            limit:1,
        })
        .send();
    //    console.log(response.body.features[0].geometry);

    let url=req.file.path;
    let filename=req.file.filename;
    const newListing=new Listing(req.body.listing);
    newListing.owner=req.user._id;
    newListing.image={url,filename};

    newListing.geometry=response.body.features[0].geometry;
    
    await newListing.save();
    console.log(newListing); 
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
};

module.exports.renderEditForm=async (req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested doesnt exist");
        res.redirect("/listings");
    }
    let originalImageUrl=listing.image.url;
    originalImageUrl.replace("/upload","/upload/w_250"); // cloudinaray changes

    res.render("listings/edit.ejs",{listing ,originalImageUrl});
};

module.exports.updateListing=async (req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});//deconstructing javascript object
    
    if(typeof req.file !="undefined"){
        let url=req.file.path;
        let filename=req.file.filename;
        listing.image={url,filename};
        await listing.save();
    }

    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`)
};

module.exports.deleteListing=async (req,res)=>{
    let { id }=req.params;
    let deleted=await Listing.findByIdAndDelete(id);
    console.log(deleted);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
};